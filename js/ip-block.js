// EXQ Studio IP访问拦截器
// 禁止通过IP地址直接访问网站，但允许本地开发
(function() {
    'use strict';
    
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
    
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    // 检查是否为本地开发环境
    const isLocalDev = LOCAL_HOSTS.includes(currentHost) || 
                       currentProtocol === 'file:' ||
                       currentHost.startsWith('127.') ||
                       currentHost.startsWith('192.168.') ||
                       currentHost.startsWith('10.') ||
                       isDevelopmentMode();
    
    // 如果是本地开发环境，直接允许访问
    if (isLocalDev) {
        console.log('🔓 本地开发环境检测到，允许访问');
        console.log('💡 环境信息:', {
            host: currentHost,
            protocol: currentProtocol,
            devMode: isDevelopmentMode()
        });
        return;
    }
    
    // 检查是否为IP地址
    const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentHost);
    
    // 检查是否为允许的域名
    const isDomainAllowed = ALLOWED_DOMAINS.includes(currentHost);
      // 如果是IP访问或不在允许域名列表中，直接断开连接
    if (isIP || !isDomainAllowed) {
        // 记录拦截日志（静默模式，不在console输出避免暴露）
        
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
            // 发送最后一个信号表示连接被拒绝
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
