// EXQ Studio IP访问拦截器
// 禁止通过IP地址直接访问网站，但允许本地开发
(function() {
    'use strict';
    
    // 私有IP地址检测函数
    const isPrivateIP = (ip) => {
        const parts = ip.split('.').map(num => parseInt(num));
        if (parts.length !== 4) return false;
        
        // 私有IP段：
        // 10.0.0.0 - 10.255.255.255
        // 172.16.0.0 - 172.31.255.255  
        // 192.168.0.0 - 192.168.255.255
        // 127.0.0.0 - 127.255.255.255 (回环地址)
        return (parts[0] === 10) ||
               (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
               (parts[0] === 192 && parts[1] === 168) ||
               (parts[0] === 127);
    };
    
    // 开发模式检测 - 可以通过URL参数或localStorage设置
    const isDevelopmentMode = () => {
        // 检查URL参数
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dev') === 'true') return true;
        
        // 检查localStorage
        try {
            if (localStorage.getItem('dev_mode') === 'true') return true;
        } catch(e) {}
        
        return false;
    };
    
    // 允许的域名列表
    const ALLOWED_DOMAINS = [
        'exqstudio.cn',
        'www.exqstudio.cn',
        'exq-studio.github.io'
    ];
    
    // 本地开发环境检测
    const LOCAL_HOSTS = [
        'localhost',
        '127.0.0.1',
        '::1',
        ''  // 本地文件协议 (file://)
    ];
    
    // 服务器IP列表 - 这些IP必须被拦截
    const SERVER_IPS = [
        '47.84.202.74'  // 你的服务器IP，必须通过域名访问
    ];
    
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    // 检查是否为IP地址格式
    const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentHost);
    
    // 第一优先级：强制拦截服务器IP访问
    if (SERVER_IPS.includes(currentHost)) {
        console.log('🚫 服务器IP访问被拦截:', currentHost);
        // 立即重定向到正确域名
        window.location.replace('https://exqstudio.cn' + window.location.pathname + window.location.search);
        return;
    }
    
    // 第二优先级：检查是否为本地开发环境
    const isLocalDev = LOCAL_HOSTS.includes(currentHost) || 
                       currentProtocol === 'file:' ||
                       (isIP && isPrivateIP(currentHost)) ||
                       isDevelopmentMode();
    
    // 如果是本地开发环境，允许访问
    if (isLocalDev) {
        console.log('🔓 本地开发环境，允许访问');
        return;
    }
    
    // 第三优先级：检查是否为允许的域名
    const isDomainAllowed = ALLOWED_DOMAINS.includes(currentHost);
    if (isDomainAllowed) {
        console.log('✅ 授权域名访问');
        return;
    }
      // 第四优先级：拦截所有其他IP访问和未授权域名
    if (isIP || !isDomainAllowed) {
        console.log('🚫 拦截未授权访问:', currentHost);
        
        // 记录拦截日志（静默模式）
        
        // 立即停止页面加载
        if (window.stop) {
            window.stop();
        }
        
        // 清空整个页面
        document.documentElement.innerHTML = '';
        
        // 尝试关闭窗口/标签页
        try {
            window.close();
        } catch(e) {
            // 如果无法关闭窗口，尝试其他方式
        }
        
        // 重定向到无效地址强制断开连接
        try {
            window.location.href = 'about:blank';
        } catch(e) {
            // 备用方案：跳转到不存在的地址
            window.location.href = 'javascript:void(0);';
        }
        
        // 阻止页面被嵌入iframe
        if (window.top !== window.self) {
            try {
                window.top.location = 'about:blank';
            } catch(e) {
                window.top.close();
            }
        }
        
        // 强制停止所有网络请求
        if (navigator.sendBeacon) {
            navigator.sendBeacon('data:text/plain,connection_denied');
        }
        
        // 清除所有定时器
        const maxTimerId = setTimeout(() => {}, 0);
        for (let i = 1; i <= maxTimerId; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
        
        // 移除所有事件监听器
        window.removeEventListener = () => {};
        document.removeEventListener = () => {};
        
        // 抛出致命错误强制停止执行
        throw new Error('Connection terminated - IP access denied');
    }
})();
