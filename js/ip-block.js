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
