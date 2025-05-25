  // 创建动态背景粒子
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            
            particlesContainer.appendChild(particle);
        }
    }

    // Cookie操作函数
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
            if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
        }
        return null;
    }

    // 弹窗功能
    let countdownTimer;
    let remainingTime = 5;

    function showPopup() {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('mask').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        remainingTime = 5;
        document.getElementById('closePopup').disabled = true;
        document.getElementById('closePopup').textContent = `${remainingTime}秒后可关闭`;
        
        countdownTimer = setInterval(() => {
            remainingTime--;
            if (remainingTime > 0) {
                document.getElementById('closePopup').textContent = `${remainingTime}秒后可关闭`;
            } else {
                document.getElementById('closePopup').disabled = false;
                document.getElementById('closePopup').textContent = '关闭';
                clearInterval(countdownTimer);
            }
        }, 1000);
    }

    function closePopup() {
        if (remainingTime <= 0) {
            document.getElementById('popup').style.display = 'none';
            document.getElementById('mask').style.display = 'none';
            document.body.style.overflow = 'auto';
            clearInterval(countdownTimer);
            
            // 用户看完弹窗后，记录到cookie（有效期365天）
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('seenPopup', 'true');
            } else {
                setCookie('seenPopup', 'true', 365);
            }
        }
    }

    // 移动端菜单切换
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    // 点击遮罩关闭弹窗
    document.getElementById('mask').addEventListener('click', closePopup);

    // 页面加载时执行
    document.addEventListener('DOMContentLoaded', () => {
        createParticles();
        
        // 检查用户是否第一次访问
        let seenPopup = false;
        if (typeof(Storage) !== "undefined") {
            seenPopup = localStorage.getItem('seenPopup') === 'true';
        } else {
            seenPopup = getCookie('seenPopup') === 'true';
        }
        
        // 如果是第一次访问，显示弹窗
        if (!seenPopup) {
            setTimeout(showPopup, 1000); // 延迟1秒显示，用户体验更好
        }
    });

    // 鼠标点击效果
    document.addEventListener('click', function(e) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';
        ripple.style.animation = 'ripple 0.6s ease-out';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    // 添加涟漪动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);