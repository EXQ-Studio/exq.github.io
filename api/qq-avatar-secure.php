<?php
/**
 * EXQ Studio QQ头像API - 安全增强版
 * 版本: 2.0
 * 更新时间: 2025-05-29
 * 安全特性: 速率限制、CORS控制、输入验证、安全日志
 */

session_start();

// 基本安全头部
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// 严格的 CORS 策略
$allowed_origins = [
    'https://exqstudio.cn',
    'https://www.exqstudio.cn',
    'http://localhost:3000', // 开发环境
    'http://127.0.0.1:5500'  // Live Server
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: https://exqstudio.cn');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只允许 GET 请求
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => '不支持的请求方法']);
    exit;
}

// 获取客户端信息
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
$request_time = time();

// 安全日志记录函数
function logSecurityEvent($event_type, $details) {
    global $client_ip, $user_agent;
    
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $client_ip,
        'user_agent' => substr($user_agent, 0, 200),
        'event' => $event_type,
        'details' => $details
    ];
    
    // 记录到错误日志
    error_log('[EXQ-SECURITY] ' . json_encode($log_entry, JSON_UNESCAPED_UNICODE));
}

// 速率限制 (每分钟30次请求)
$rate_limit_key = "rate_limit_$client_ip";

if (!isset($_SESSION[$rate_limit_key])) {
    $_SESSION[$rate_limit_key] = [
        'count' => 0, 
        'reset_time' => $request_time + 60,
        'first_request' => $request_time
    ];
}

$rate_data = $_SESSION[$rate_limit_key];

// 重置计数器
if ($request_time > $rate_data['reset_time']) {
    $_SESSION[$rate_limit_key] = [
        'count' => 1, 
        'reset_time' => $request_time + 60,
        'first_request' => $request_time
    ];
} elseif ($rate_data['count'] >= 30) {
    // 速率限制触发
    logSecurityEvent('RATE_LIMIT_EXCEEDED', [
        'requests_count' => $rate_data['count'],
        'time_window' => $request_time - $rate_data['first_request']
    ]);
    
    http_response_code(429);
    header('Retry-After: ' . ($rate_data['reset_time'] - $request_time));
    echo json_encode([
        'error' => '请求过于频繁，请稍后再试',
        'retry_after' => $rate_data['reset_time'] - $request_time,
        'limit' => 30,
        'window' => 60
    ]);
    exit;
} else {
    $_SESSION[$rate_limit_key]['count']++;
}

// 输入验证和清理
$qq = $_GET['qq'] ?? '';

// 基本输入清理
$qq = trim($qq);
$qq = filter_var($qq, FILTER_SANITIZE_NUMBER_INT);

if (empty($qq)) {
    logSecurityEvent('INVALID_INPUT', ['error' => 'empty_qq', 'input' => $_GET['qq'] ?? 'null']);
    http_response_code(400);
    echo json_encode(['error' => 'QQ号参数无效']);
    exit;
}

// 严格的QQ号验证
if (!preg_match('/^[1-9]\d{4,11}$/', $qq)) {
    logSecurityEvent('INVALID_INPUT', ['error' => 'invalid_format', 'qq' => $qq]);
    http_response_code(400);
    echo json_encode(['error' => 'QQ号格式错误，应为5-12位数字']);
    exit;
}

// QQ号范围验证
$qq_num = intval($qq);
if ($qq_num < 10000 || $qq_num > 999999999999) {
    logSecurityEvent('INVALID_INPUT', ['error' => 'out_of_range', 'qq' => $qq]);
    http_response_code(400);
    echo json_encode(['error' => 'QQ号超出有效范围']);
    exit;
}

// 可疑QQ号检测 (防止恶意测试)
$suspicious_patterns = [
    '123456789',
    '987654321',
    '111111111',
    '000000000'
];

foreach ($suspicious_patterns as $pattern) {
    if (strpos($qq, $pattern) !== false) {
        logSecurityEvent('SUSPICIOUS_REQUEST', ['qq' => $qq, 'pattern' => $pattern]);
        break;
    }
}

// 安全的头像API列表
$avatar_apis = [
    "https://q1.qlogo.cn/g?b=qq&nk=$qq&s=640",
    "https://q2.qlogo.cn/headimg_dl/$qq/640"
];

// 安全的HTTP上下文配置
$http_context = stream_context_create([
    'http' => [
        'timeout' => 10,
        'user_agent' => 'EXQ-Studio-Avatar-Checker/2.0',
        'follow_location' => 0,
        'max_redirects' => 0,
        'ignore_errors' => true
    ]
]);

$avatar_found = false;
$api_errors = [];

// 尝试获取头像
foreach ($avatar_apis as $index => $url) {
    try {
        // 验证URL安全性
        $parsed_url = parse_url($url);
        if (!$parsed_url || !in_array($parsed_url['host'], ['q1.qlogo.cn', 'q2.qlogo.cn', 'thirdqq.qlogo.cn'])) {
            $api_errors[] = "不安全的API域名: " . ($parsed_url['host'] ?? 'unknown');
            continue;
        }
        
        $headers = @get_headers($url, 1, $http_context);
        
        if ($headers && is_array($headers)) {
            $status_line = $headers[0] ?? '';
            
            if (strpos($status_line, '200') !== false) {
                // 检查内容类型
                $content_type = '';
                foreach ($headers as $key => $value) {
                    if (stripos($key, 'content-type') !== false) {
                        $content_type = is_array($value) ? $value[0] : $value;
                        break;
                    }
                }
                
                // 确保是图片类型
                if (strpos($content_type, 'image/') !== false || empty($content_type)) {
                    $avatar_found = true;
                    
                    // 记录成功的请求
                    logSecurityEvent('AVATAR_SUCCESS', [
                        'qq' => $qq,
                        'api_index' => $index,
                        'url' => $url,
                        'content_type' => $content_type
                    ]);
                    
                    echo json_encode([
                        'success' => true,
                        'avatar_url' => $url,
                        'qq' => $qq,
                        'api_source' => $index + 1,
                        'timestamp' => $request_time,
                        'cache_duration' => 3600 // 1小时缓存建议
                    ]);
                    exit;
                }
            }
        }
        
        $api_errors[] = "API $index 响应异常";
        
    } catch (Exception $e) {
        $api_errors[] = "API $index 请求失败: " . $e->getMessage();
    }
}

// 所有API都失败
logSecurityEvent('AVATAR_FAILED', [
    'qq' => $qq,
    'errors' => $api_errors,
    'api_count' => count($avatar_apis)
]);

http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => '无法获取QQ头像',
    'qq' => $qq,
    'timestamp' => $request_time,
    'debug' => count($api_errors) > 0 ? '所有头像服务暂时不可用' : '未知错误'
]);
?>
