// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('dlOverlay');
    const closeBtn = document.getElementById('closeBtn');
    const popup = overlay.querySelector('.popup');

    // 显示弹窗
    overlay.style.display = 'block';
    
    // 防止移动端滚动穿透
    document.body.style.overflow = 'hidden';
      // 设置弹窗为可聚焦并聚焦到弹窗
    popup.setAttribute('tabindex', '-1');
    setTimeout(() => {
        popup.focus();
    }, 100);

    // 点击确定按钮关闭
    function closePopup() {
        overlay.style.display = 'none';
        // 恢复页面滚动
        document.body.style.overflow = '';
        // 恢复焦点到页面主体
        document.body.focus();
    }

    closeBtn.addEventListener('click', closePopup);
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.style.display === 'block') {
            closePopup();
        }
    });
    
    // Tab键焦点管理 - 将焦点限制在弹窗内
    popup.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusableElements = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
    
    // 触摸设备优化 - 防止双击缩放
    if ('ontouchstart' in window) {
        // 移除 touchstart.preventDefault 以确保 click 事件正常触发
        
        // 移动端按钮位置动态修复
        function fixMobileButtonPosition() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile && closeBtn) {
                // 强制设置按钮样式
                closeBtn.style.position = 'relative';
                closeBtn.style.left = 'auto';
                closeBtn.style.right = 'auto';
                closeBtn.style.margin = '20px auto 10px auto';
                closeBtn.style.display = 'block';
                closeBtn.style.width = 'auto';
                closeBtn.style.maxWidth = '200px';
                closeBtn.style.minWidth = '120px';
                closeBtn.style.textAlign = 'center';
                
                // 确保父容器支持居中
                if (popup) {
                    popup.style.display = 'flex';
                    popup.style.flexDirection = 'column';
                    popup.style.alignItems = 'center';
                }
                
                // 移动端按钮位置修复已应用（静默处理）
            }
        }
        
        // 页面加载时修复
        setTimeout(fixMobileButtonPosition, 200);
        
        // 窗口大小变化时重新修复
        window.addEventListener('resize', fixMobileButtonPosition);
        
        // 为移动端添加触觉反馈（如果支持）
        closeBtn.addEventListener('click', function() {
            if ('vibrate' in navigator) {
                navigator.vibrate(50); // 轻微震动反馈
            }
        });
    }
});