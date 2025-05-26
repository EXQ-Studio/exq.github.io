    // 移动端菜单切换
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    // 导航栏滚动检测
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 100) { // 当滚动超过100像素时
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });