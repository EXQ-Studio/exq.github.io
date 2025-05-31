// 使用 DOMContentLoaded 确保页面加载完成后显示横幅
document.addEventListener('DOMContentLoaded', function () {
    var isActivityOn = true; // 若需要显示横幅，请将此变量改为 true，反之则改为 false

    if (isActivityOn) {
        var banner = document.createElement('div');
        banner.className = 'banner';
        banner.innerHTML = '<span>EXQ Studio 网站发布正式版本！<a href="recentupdate.html">>点此查看最近更新<</a></span><span class="close-btn">×</span>';

        var closeBtn = banner.querySelector('.close-btn');

        // 将横幅添加到页面顶部
        document.body.insertBefore(banner, document.body.firstChild);
        
        // 为body添加banner-active类，提供顶部间距
        document.body.classList.add('banner-active');

        closeBtn.addEventListener('click', function () {
            banner.style.display = 'none'; // 隐藏横幅
            document.body.classList.remove('banner-active'); // 移除顶部间距
        });
    }
});