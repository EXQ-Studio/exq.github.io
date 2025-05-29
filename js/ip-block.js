// EXQ Studio IP访问拦截器
// 禁止通过IP地址直接访问网站
(function() {
    'use strict';
    
    // 允许的域名列表
    const ALLOWED_DOMAINS = [
        'exqstudio.cn',
        'www.exqstudio.cn',
        'exq-studio.github.io'
    ];
    
    const currentHost = window.location.hostname;
    
    // 检查是否为IP地址
    const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentHost);
    
    // 检查是否为允许的域名
    const isDomainAllowed = ALLOWED_DOMAINS.includes(currentHost);
    
    // 如果是IP访问或不在允许域名列表中，直接拦截
    if (isIP || !isDomainAllowed) {
        // 记录拦截日志（发送到console）
        console.error('IP访问被拦截:', currentHost);
        
        // 立即清空页面内容
        document.documentElement.innerHTML = '';
        
        // 停止页面加载
        if (window.stop) {
            window.stop();
        }
        
        // 创建拦截页面
        const blockedHTML = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>访问被拒绝 - EXQ Studio</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
                        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                        color: #ff4444;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        text-align: center;
                        overflow: hidden;
                    }
                    
                    .block-container {
                        padding: 60px 40px;
                        border: 3px solid #ff4444;
                        border-radius: 15px;
                        background: rgba(255, 68, 68, 0.1);
                        backdrop-filter: blur(10px);
                        max-width: 600px;
                        width: 90%;
                        animation: glow 2s ease-in-out infinite alternate;
                    }
                    
                    @keyframes glow {
                        from { box-shadow: 0 0 20px rgba(255, 68, 68, 0.3); }
                        to { box-shadow: 0 0 40px rgba(255, 68, 68, 0.6); }
                    }
                    
                    .block-icon {
                        font-size: 6em;
                        margin-bottom: 20px;
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    
                    h1 {
                        font-size: 2.5em;
                        margin-bottom: 20px;
                        color: #ff4444;
                        font-weight: bold;
                    }
                    
                    .main-message {
                        font-size: 1.4em;
                        line-height: 1.6;
                        margin: 20px 0;
                        color: #ffffff;
                    }
                    
                    .warning {
                        color: #ffaa00;
                        font-weight: bold;
                        font-size: 1.2em;
                        margin: 25px 0;
                        padding: 15px;
                        background: rgba(255, 170, 0, 0.1);
                        border-radius: 8px;
                        border: 1px solid #ffaa00;
                    }
                    
                    .blocked-info {
                        color: #888;
                        font-family: 'Courier New', monospace;
                        font-size: 1em;
                        margin-top: 30px;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                        border: 1px solid #444;
                    }
                    
                    .security-note {
                        color: #666;
                        font-size: 0.9em;
                        margin-top: 20px;
                        line-height: 1.4;
                    }
                    
                    @media (max-width: 768px) {
                        .block-container { padding: 40px 20px; }
                        .block-icon { font-size: 4em; }
                        h1 { font-size: 2em; }
                        .main-message { font-size: 1.2em; }
                    }
                </style>
            </head>
            <body>
                <div class="block-container">
                    <div class="block-icon">🚫</div>
                    <h1>ACCESS DENIED</h1>
                    <p class="main-message">检测到通过IP地址直接访问网站</p>
                    <div class="warning">
                        ⚠️ 此行为违反安全策略，已被记录
                    </div>
                    <div class="blocked-info">
                        <strong>Blocked Address:</strong> ${currentHost}<br>
                        <strong>Time:</strong> ${new Date().toLocaleString('zh-CN')}<br>
                        <strong>Reason:</strong> IP直接访问被禁止
                    </div>
                    <p class="security-note">
                        EXQ Studio 安全防护系统<br>
                        如需访问，请使用正确的域名
                    </p>
                </div>
            </body>
            </html>
        `;
        
        // 替换页面内容
        document.open();
        document.write(blockedHTML);
        document.close();
        
        // 阻止页面被嵌入iframe
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }
        
        // 禁用开发者工具快捷键
        document.addEventListener('keydown', function(e) {
            // 禁用F12, Ctrl+Shift+I, Ctrl+U等
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
        
        // 禁用右键菜单
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // 抛出错误阻止后续脚本执行
        throw new Error('IP访问被拒绝 - Access denied for IP: ' + currentHost);
    }
})();
