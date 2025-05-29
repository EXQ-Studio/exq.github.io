<?php
function getSecurityStatus() {
    $logFile = 'security.log';
    $status = 'ok';
    $events = 0;
    
    if (file_exists($logFile)) {
        $logs = file($logFile);
        $events = count($logs);
        
        $recent = array_slice($logs, -10);
        foreach ($recent as $log) {
            if (strpos($log, 'ERROR') !== false) {
                $status = 'warning';
                break;
            }
        }
    }
    
    return [
        'status' => $status,
        'total_events' => $events,
        'last_check' => date('Y-m-d H:i:s')
    ];
}

if (isset($_GET['status'])) {
    header('Content-Type: application/json');
    echo json_encode(getSecurityStatus());
}
?>
