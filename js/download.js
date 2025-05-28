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
        closeBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        
        // 为移动端添加触觉反馈（如果支持）
        closeBtn.addEventListener('click', function() {
            if ('vibrate' in navigator) {
                navigator.vibrate(50); // 轻微震动反馈
            }
        });
    }
});