<?php
require_once 'rate-limiter.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Access-Control-Allow-Origin: https://exqstudio.cn');

$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!checkRateLimit($clientIP)) {
    http_response_code(429);
    die(json_encode(['error' => 'Rate limit exceeded']));
}

$qq = $_GET['qq'] ?? '';
if (empty($qq) || !validateQQ($qq)) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid QQ number']));
}

$avatarUrl = "https://q1.qlogo.cn/g?b=qq&nk=$qq&s=640";
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'avatar_url' => $avatarUrl
]);
?>
