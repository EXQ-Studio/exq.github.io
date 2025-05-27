<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// 获取QQ号参数
$qq = isset($_GET['qq']) ? $_GET['qq'] : '';

if (!$qq) {
    http_response_code(400);
    echo json_encode(['error' => 'QQ号不能为空']);
    exit;
}

// 验证QQ号格式
if (!preg_match('/^\d{5,12}$/', $qq)) {
    http_response_code(400);
    echo json_encode(['error' => 'QQ号格式不正确']);
    exit;
}

// QQ头像API列表
$avatarApis = [
    "https://q1.qlogo.cn/g?b=qq&nk={$qq}&s=640",
    "https://q2.qlogo.cn/headimg_dl/{$qq}/640",
    "https://thirdqq.qlogo.cn/g?b=qq&nk={$qq}&s=640"
];

// 尝试获取头像
foreach ($avatarApis as $url) {
    $headers = get_headers($url, 1);
    if ($headers && strpos($headers[0], '200') !== false) {
        echo json_encode([
            'success' => true,
            'avatar_url' => $url,
            'qq' => $qq
        ]);
        exit;
    }
}

// 如果所有API都失败
http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => '无法获取QQ头像',
    'qq' => $qq
]);
?>
