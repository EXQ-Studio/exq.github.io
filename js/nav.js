// 移动端菜单切换
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (navMenu.classList.contains('mobile-active')) {
        // 关闭菜单
        navMenu.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            navMenu.classList.remove('mobile-active');
            navMenu.style.animation = '';
        }, 300);
        menuToggle.innerHTML = '☰';
    } else {
        // 打开菜单
        navMenu.classList.add('mobile-active');
        menuToggle.innerHTML = '✕';
    }
}

// 点击菜单项后自动关闭移动端菜单
function closeMobileMenuOnClick() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navMenu.classList.contains('mobile-active')) {
                navMenu.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    navMenu.classList.remove('mobile-active');
                    navMenu.style.animation = '';
                }, 300);
                menuToggle.innerHTML = '☰';
            }
        });
    });
}

// 点击页面其他地方关闭移动端菜单
function closeMobileMenuOnOutsideClick() {
    document.addEventListener('click', (e) => {
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        const navContainer = document.querySelector('.nav-container');
        
        if (window.innerWidth <= 768 && 
            navMenu.classList.contains('mobile-active') && 
            !navContainer.contains(e.target)) {
            navMenu.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                navMenu.classList.remove('mobile-active');
                navMenu.style.animation = '';
            }, 300);
            menuToggle.innerHTML = '☰';
        }
    });
}

// 导航栏滚动检测
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// 窗口大小变化时重置菜单状态
window.addEventListener('resize', function() {
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth > 768) {
        navMenu.classList.remove('mobile-active');
        navMenu.style.animation = '';
        menuToggle.innerHTML = '☰';
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    closeMobileMenuOnClick();
    closeMobileMenuOnOutsideClick();
});