<?php
/**
 * 🛡️ EXQ Studio 安全监控系统
 * ===========================
 * 功能: 实时监控网站安全状态，记录异常行为，生成安全报告
 * 版本: 1.0
 * 创建时间: <?php echo date('Y-m-d H:i:s'); ?>
 */

class SecurityMonitor {
    private $logFile = 'logs/security.log';
    private $alertThreshold = 10; // 异常阈值
    private $timeWindow = 3600; // 1小时时间窗口
    
    public function __construct() {
        // 确保日志目录存在
        if (!is_dir('logs')) {
            mkdir('logs', 0755, true);
        }
    }
    
    /**
     * 记录安全事件
     */
    public function logSecurityEvent($type, $details, $severity = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $this->getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        
        $logEntry = [
            'timestamp' => $timestamp,
            'ip' => $ip,
            'type' => $type,
            'severity' => $severity,
            'details' => $details,
            'user_agent' => $userAgent,
            'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
            'referer' => $_SERVER['HTTP_REFERER'] ?? ''
        ];
        
        $logLine = json_encode($logEntry) . "\n";
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
        
        // 如果是高危事件，立即检查是否需要报警
        if (in_array($severity, ['WARNING', 'CRITICAL'])) {
            $this->checkAlertThreshold($ip, $type);
        }
    }
    
    /**
     * 检测常见攻击模式
     */
    public function detectAttacks() {
        $ip = $this->getClientIP();
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // SQL 注入检测
        $sqlPatterns = [
            '/union\s+select/i',
            '/select\s+\*\s+from/i',
            '/drop\s+table/i',
            '/insert\s+into/i',
            '/delete\s+from/i',
            '/\'\s*or\s*\'/i',
            '/\'\s*and\s*\'/i'
        ];
        
        foreach ($sqlPatterns as $pattern) {
            if (preg_match($pattern, $uri) || preg_match($pattern, http_build_query($_GET))) {
                $this->logSecurityEvent('SQL_INJECTION_ATTEMPT', 
                    "Potential SQL injection detected in URI: $uri", 'CRITICAL');
                return false;
            }
        }
        
        // XSS 检测
        $xssPatterns = [
            '/<script/i',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/<iframe/i',
            '/<object/i',
            '/<embed/i'
        ];
        
        foreach ($xssPatterns as $pattern) {
            if (preg_match($pattern, $uri) || preg_match($pattern, http_build_query($_GET))) {
                $this->logSecurityEvent('XSS_ATTEMPT', 
                    "Potential XSS attack detected in URI: $uri", 'WARNING');
            }
        }
        
        // 路径遍历检测
        if (preg_match('/\.\.\//i', $uri) || preg_match('/\.\.\\\\/i', $uri)) {
            $this->logSecurityEvent('PATH_TRAVERSAL_ATTEMPT', 
                "Path traversal attempt detected: $uri", 'WARNING');
        }
        
        // 恶意 User-Agent 检测
        $maliciousAgents = [
            'sqlmap',
            'nikto',
            'dirb',
            'dirbuster',
            'nmap',
            'masscan',
            'python-requests/2.6.0'
        ];
        
        foreach ($maliciousAgents as $agent) {
            if (stripos($userAgent, $agent) !== false) {
                $this->logSecurityEvent('MALICIOUS_USER_AGENT', 
                    "Malicious user agent detected: $userAgent", 'WARNING');
            }
        }
        
        return true;
    }
    
    /**
     * 速率限制检查
     */
    public function checkRateLimit($maxRequests = 100, $timeWindow = 3600) {
        $ip = $this->getClientIP();
        $currentTime = time();
        
        // 读取最近的请求记录
        $requests = $this->getRecentRequests($ip, $timeWindow);
        
        if (count($requests) >= $maxRequests) {
            $this->logSecurityEvent('RATE_LIMIT_EXCEEDED', 
                "Rate limit exceeded: $maxRequests requests in {$timeWindow}s", 'WARNING');
            
            // 返回 429 状态码
            http_response_code(429);
            header('Retry-After: ' . $timeWindow);
            echo json_encode(['error' => 'Rate limit exceeded']);
            exit;
        }
        
        // 记录当前请求
        $this->recordRequest($ip, $currentTime);
        return true;
    }
    
    /**
     * 生成安全报告
     */
    public function generateSecurityReport($hours = 24) {
        $since = date('Y-m-d H:i:s', time() - ($hours * 3600));
        $events = $this->getEventsFromLog($since);
        
        $report = [
            'generated_at' => date('Y-m-d H:i:s'),
            'period' => "{$hours} hours",
            'total_events' => count($events),
            'summary' => [],
            'top_ips' => [],
            'attack_types' => [],
            'severity_breakdown' => []
        ];
        
        // 统计分析
        $ipCounts = [];
        $typeCounts = [];
        $severityCounts = [];
        
        foreach ($events as $event) {
            $data = json_decode($event, true);
            if (!$data) continue;
            
            // IP 统计
            $ip = $data['ip'] ?? 'unknown';
            $ipCounts[$ip] = ($ipCounts[$ip] ?? 0) + 1;
            
            // 攻击类型统计
            $type = $data['type'] ?? 'unknown';
            $typeCounts[$type] = ($typeCounts[$type] ?? 0) + 1;
            
            // 严重程度统计
            $severity = $data['severity'] ?? 'INFO';
            $severityCounts[$severity] = ($severityCounts[$severity] ?? 0) + 1;
        }
        
        // 排序并取前10
        arsort($ipCounts);
        arsort($typeCounts);
        
        $report['top_ips'] = array_slice($ipCounts, 0, 10, true);
        $report['attack_types'] = $typeCounts;
        $report['severity_breakdown'] = $severityCounts;
        
        return $report;
    }
    
    /**
     * 获取客户端IP
     */
    private function getClientIP() {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if ($key === 'HTTP_X_FORWARDED_FOR') {
                    $ip = explode(',', $ip)[0];
                }
                return trim($ip);
            }
        }
        
        return 'unknown';
    }
    
    /**
     * 检查报警阈值
     */
    private function checkAlertThreshold($ip, $type) {
        $recentEvents = $this->getRecentSecurityEvents($ip, $this->timeWindow);
        
        if (count($recentEvents) >= $this->alertThreshold) {
            $this->sendAlert($ip, $type, count($recentEvents));
        }
    }
    
    /**
     * 获取最近的安全事件
     */
    private function getRecentSecurityEvents($ip, $timeWindow) {
        $events = [];
        $since = time() - $timeWindow;
        
        if (file_exists($this->logFile)) {
            $lines = file($this->logFile, FILE_IGNORE_NEW_LINES);
            foreach ($lines as $line) {
                $data = json_decode($line, true);
                if ($data && $data['ip'] === $ip && strtotime($data['timestamp']) > $since) {
                    $events[] = $data;
                }
            }
        }
        
        return $events;
    }
    
    /**
     * 发送安全警报
     */
    private function sendAlert($ip, $type, $count) {
        $this->logSecurityEvent('SECURITY_ALERT', 
            "Security alert triggered for IP $ip: $count events of type $type", 'CRITICAL');
        
        // 这里可以集成邮件、短信或其他通知方式
        // 例如: mail(), curl 到 webhook 等
    }
    
    /**
     * 从日志文件获取事件
     */
    private function getEventsFromLog($since) {
        $events = [];
        
        if (file_exists($this->logFile)) {
            $lines = file($this->logFile, FILE_IGNORE_NEW_LINES);
            foreach ($lines as $line) {
                $data = json_decode($line, true);
                if ($data && strtotime($data['timestamp']) >= strtotime($since)) {
                    $events[] = $line;
                }
            }
        }
        
        return $events;
    }
    
    /**
     * 获取最近的请求记录
     */
    private function getRecentRequests($ip, $timeWindow) {
        $requestFile = "logs/requests_$ip.log";
        $requests = [];
        $since = time() - $timeWindow;
        
        if (file_exists($requestFile)) {
            $lines = file($requestFile, FILE_IGNORE_NEW_LINES);
            foreach ($lines as $line) {
                $timestamp = intval(trim($line));
                if ($timestamp > $since) {
                    $requests[] = $timestamp;
                }
            }
        }
        
        return $requests;
    }
    
    /**
     * 记录请求
     */
    private function recordRequest($ip, $timestamp) {
        $requestFile = "logs/requests_$ip.log";
        file_put_contents($requestFile, $timestamp . "\n", FILE_APPEND | LOCK_EX);
        
        // 清理旧记录
        $this->cleanOldRequests($requestFile, 7200); // 保留2小时
    }
    
    /**
     * 清理旧请求记录
     */
    private function cleanOldRequests($file, $maxAge) {
        if (!file_exists($file)) return;
        
        $lines = file($file, FILE_IGNORE_NEW_LINES);
        $cutoff = time() - $maxAge;
        $newLines = [];
        
        foreach ($lines as $line) {
            $timestamp = intval(trim($line));
            if ($timestamp > $cutoff) {
                $newLines[] = $line;
            }
        }
        
        file_put_contents($file, implode("\n", $newLines) . "\n");
    }
}

// 如果直接访问此文件，显示安全报告
if (basename($_SERVER['PHP_SELF']) === 'security-monitor.php') {
    $monitor = new SecurityMonitor();
    
    // 执行安全检测
    if (!$monitor->detectAttacks()) {
        exit; // 检测到攻击，已记录并退出
    }
    
    // 检查速率限制
    $monitor->checkRateLimit();
    
    // 生成并显示报告
    $report = $monitor->generateSecurityReport(24);
    
    header('Content-Type: application/json');
    echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>
