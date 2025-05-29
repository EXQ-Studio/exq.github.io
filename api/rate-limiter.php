<?php
// Simple rate limiting for QQ Avatar API
function checkRateLimit($ip) {
    $limitFile = 'rate_limits.json';
    $maxRequests = 30;
    $timeWindow = 60;
    
    $limits = [];
    if (file_exists($limitFile)) {
        $limits = json_decode(file_get_contents($limitFile), true) ?: [];
    }
    
    $now = time();
    $clientKey = md5($ip);
    
    foreach ($limits as $key => $data) {
        if ($now - $data['time'] > $timeWindow) {
            unset($limits[$key]);
        }
    }
    
    if (!isset($limits[$clientKey])) {
        $limits[$clientKey] = ['count' => 1, 'time' => $now];
    } else {
        if ($now - $limits[$clientKey]['time'] > $timeWindow) {
            $limits[$clientKey] = ['count' => 1, 'time' => $now];
        } else {
            if ($limits[$clientKey]['count'] >= $maxRequests) {
                file_put_contents($limitFile, json_encode($limits));
                return false;
            }
            $limits[$clientKey]['count']++;
        }
    }
    
    file_put_contents($limitFile, json_encode($limits));
    return true;
}

function validateQQ($qq) {
    return preg_match('/^[1-9][0-9]{4,10}$/', $qq);
}
?>
