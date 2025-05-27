// 添加加载页面到 DOM
document.body.insertAdjacentHTML('afterbegin', `
    <div class="loading-container">
        <div class="loading-content">
            <div class="loading-animation">
                <div class="loading-circle"></div>
                <div class="loading-circle"></div>
                <div class="loading-circle"></div>
            </div>
            <div class="loading-progress-container">
                <div class="progress-percentage">0%</div>
                <div class="progress-bar"></div>
            </div>
            <div class="loading-text">加载中</div>
            <div class="loading-current-resource">正在初始化...</div>
        </div>
    </div>
`);

// 资源加载管理
class ResourceLoader {
    constructor() {
        this.loadingContainer = document.querySelector('.loading-container');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressPercentage = document.querySelector('.progress-percentage');
        this.loadingCurrentResource = document.querySelector('.loading-current-resource'); // 新增
        this.pages = document.querySelector('.pages');
        this.resources = new Set();
        this.loadedResources = new Set();
        this.totalResources = 0;
        this.isLoading = true;
        this.loadingTimeout = null;
    }

    // 添加需要加载的资源
    addResource(resource) {
        if (!this.resources.has(resource)) {
            this.resources.add(resource);
            this.totalResources++;
        }
    }

    // 更新加载进度
    updateProgress() {
        if (this.totalResources === 0) {
            this.progressBar.style.width = '100%';
            this.progressPercentage.textContent = '100%';
            if (this.isLoading) { // 只有在加载过程中才更新文本并完成
                this.loadingCurrentResource.textContent = '未找到需加载的资源';
                this.completeLoading();
            }
            return;
        }

        const progress = Math.min(100, Math.round((this.loadedResources.size / this.totalResources) * 100));
        this.progressBar.style.width = `${progress}%`;
        this.progressPercentage.textContent = `${progress}%`;

        if (this.loadedResources.size === this.totalResources && this.isLoading) {
            this.completeLoading();
        }
    }

    // 完成加载
    completeLoading() {
        if (!this.isLoading) return;
        this.isLoading = false;

        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }

        // 确保显示100%
        this.progressBar.style.width = '100%';
        this.progressPercentage.textContent = '100%';
        this.loadingCurrentResource.textContent = '加载完成!';

        // 延迟隐藏加载页面
        setTimeout(() => {
            this.loadingContainer.style.opacity = '0';
            setTimeout(() => {
                this.loadingContainer.style.display = 'none';
                // 显示页面内容
                this.pages.style.display = 'flex';
                // 使用 requestAnimationFrame 确保 DOM 更新
                requestAnimationFrame(() => {
                    this.pages.classList.add('loaded');
                    // 初始化页面
                    initializePages();
                });
            }, 600);
        }, 500);
    }

    // 处理资源加载完成
    handleResourceLoad(resource) {
        this.loadedResources.add(resource);
        // 更新当前加载的资源文本
        if (this.isLoading) { // 只有在加载过程中才更新
            this.loadingCurrentResource.textContent = `已加载: ${this.getFriendlyResourceName(resource)}`;
        }
        this.updateProgress();
    }

    // 处理资源加载失败
    handleResourceError(resource) {
        console.warn(`Failed to load resource: ${resource}`);
        // 更新当前加载的资源文本（即使失败）
        if (this.isLoading) { // 只有在加载过程中才更新
            this.loadingCurrentResource.textContent = `加载失败: ${this.getFriendlyResourceName(resource)}`;
        }
        this.handleResourceLoad(resource); // 即使失败也计入进度，并触发updateProgress
    }

    // 获取更友好的资源名称用于显示
    getFriendlyResourceName(resource) {
        if (typeof resource !== 'string') {
            return '未知资源';
        }
        if (resource === 'font') {
            return '字体文件';
        }
        try {
            const url = new URL(resource, document.baseURI);
            let parts = url.pathname.split('/');
            let fileName = parts.pop() || parts.pop(); // Handles potential trailing slash

            if (!fileName && url.hostname === location.hostname && url.pathname === '/') {
                 fileName = '主页文档';
            } else if (!fileName) {
                 fileName = url.hostname;
            }

            if (fileName && fileName.length > 35) {
                fileName = '...' + fileName.slice(-32);
            }
            return fileName || resource;
        } catch (e) {
            let parts = resource.split('/');
            let fileName = parts.pop();
            if (fileName && fileName.length > 35) {
                fileName = '...' + fileName.slice(-32);
            }
            return fileName || resource;
        }
    }

    // 开始加载所有资源
    startLoading() {
        // 确保页面初始状态
        this.pages.style.display = 'none';
        this.pages.classList.remove('loaded');
        this.loadingCurrentResource.textContent = '扫描资源中...'; // 设置初始扫描信息

        // 添加所有图片资源
        document.querySelectorAll('img').forEach(img => {
            this.addResource(img.src);
            if (img.complete && img.naturalHeight !== 0) {
                this.handleResourceLoad(img.src);
            } else {
                img.addEventListener('load', () => this.handleResourceLoad(img.src));
                img.addEventListener('error', () => this.handleResourceError(img.src));
            }
        });

        // 添加所有样式表
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            this.addResource(link.href);
            if (link.sheet) {
                this.handleResourceLoad(link.href);
            } else {
                link.addEventListener('load', () => this.handleResourceLoad(link.href));
                link.addEventListener('error', () => this.handleResourceError(link.href));
            }
        });

        // 添加所有脚本
        document.querySelectorAll('script').forEach(script => {
            if (script.src) {
                this.addResource(script.src);
                if (script.complete || script.readyState === 'complete') {
                    this.handleResourceLoad(script.src);
                } else {
                    script.addEventListener('load', () => this.handleResourceLoad(script.src));
                    script.addEventListener('error', () => this.handleResourceError(script.src));
                }
            }
        });

        // 添加字体文件
        const fontFamilies = Array.from(document.fonts).map(font => font.family);
        const zankuFontNeeded = fontFamilies.some(family => family.includes('站酷文艺体'));
        
        if (zankuFontNeeded) {
            this.addResource('font');
            document.fonts.ready.then(() => {
                this.handleResourceLoad('font');
            }).catch(err => {
                console.warn('Font loading error or timeout:', err);
                this.handleResourceError('font');
            });
        }

        // 检查是否有资源需要加载
        if (this.totalResources === 0) {
            console.log("No resources found to load.");
            // updateProgress 会处理后续的 completeLoading 调用
            this.updateProgress(); // 这会触发 totalResources === 0 的逻辑
            return; 
        } else {
            this.loadingCurrentResource.textContent = '开始加载资源...';
        }

        // 设置超时保护
        this.loadingTimeout = setTimeout(() => {
            if (this.isLoading) {
                console.warn('Loading timeout reached, forcing completion');
                this.loadingCurrentResource.textContent = '加载超时，强制完成';
                this.completeLoading();
            }
        }, 10000);
    }
}

// 页面初始化
function initializePages() {
    const pages = document.querySelectorAll('.page');
    let currentPage = 0;
    let isScrolling = false;

    function updatePageClasses() {
        pages.forEach((page, index) => {
            page.classList.remove('prev', 'current', 'next');
            if (index < currentPage) {
                page.classList.add('prev');
            } else if (index === currentPage) {
                page.classList.add('current');
            } else {
                page.classList.add('next');
            }
        });
    }    function setupEventListeners() {
        // 鼠标滚轮事件
        document.querySelector('.pages').addEventListener('wheel', handleWheel);

        // 触摸事件（只在移动端启用）
        if (window.innerWidth <= 768) {
            let touchStartY = 0;
            let touchStartX = 0;
            let touchStartTime = 0;
            let touchTimeout = null;
            let isTouching = false;

            document.querySelector('.pages').addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                touchStartTime = Date.now();
                isTouching = true;
                
                // 清除之前的超时
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                    touchTimeout = null;
                }
            }, { passive: true });

            document.querySelector('.pages').addEventListener('touchmove', (e) => {
                if (!isTouching) return;
                
                // 防止页面滚动
                e.preventDefault();
                
                const touchEndY = e.touches[0].clientY;
                const touchEndX = e.touches[0].clientX;
                const deltaY = touchStartY - touchEndY;
                const deltaX = touchStartX - touchEndX;
                
                // 检查是否为垂直滑动（而不是水平滑动）
                if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
                    // 防抖处理
                    if (touchTimeout) {
                        clearTimeout(touchTimeout);
                    }
                    
                    touchTimeout = setTimeout(() => {
                        if (!isScrolling && isTouching) {
                            if (deltaY > 50 && currentPage < pages.length - 1) {
                                changePage(1);
                                isTouching = false;
                            } else if (deltaY < -50 && currentPage > 0) {
                                changePage(-1);
                                isTouching = false;
                            }
                        }
                    }, 100);
                }
            }, { passive: false });

            document.querySelector('.pages').addEventListener('touchend', (e) => {
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;
                
                // 快速滑动检测
                if (touchDuration < 300 && isTouching) {
                    const touchEndY = e.changedTouches[0].clientY;
                    const deltaY = touchStartY - touchEndY;
                    
                    if (Math.abs(deltaY) > 80 && !isScrolling) {
                        if (deltaY > 0 && currentPage < pages.length - 1) {
                            changePage(1);
                        } else if (deltaY < 0 && currentPage > 0) {
                            changePage(-1);
                        }
                    }
                }
                
                isTouching = false;
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                    touchTimeout = null;
                }
            }, { passive: true });

            // 阻止双击缩放（只在移动端）
            document.querySelector('.pages').addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }        // 返回按钮事件
        const backButton = document.querySelector('#back-to-home');
        const backButtonLink = document.querySelector('#back-to-home .back-home-btn');
        if (backButton && backButtonLink) {
            // 为整个按钮容器添加点击事件
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (currentPage > 0) {
                    // 如果不在第一页，返回第一页
                    changePage(-currentPage);
                } else {
                    // 如果在第一页，跳转到首页
                    window.location.href = '/';
                }
            });
            
            // 为链接本身也添加点击事件（防止默认跳转）
            backButtonLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (currentPage > 0) {
                    // 如果不在第一页，返回第一页
                    changePage(-currentPage);
                } else {
                    // 如果在第一页，跳转到首页
                    window.location.href = '/';
                }
            });
        }
    }

    function handleWheel(e) {
        if (isScrolling) return;

        if (e.deltaY > 0 && currentPage < pages.length - 1) {
            changePage(1);
        } else if (e.deltaY < 0 && currentPage > 0) {
            changePage(-1);
        }
    }

    function changePage(direction) {
        isScrolling = true;
        currentPage += direction;
        updatePageClasses();

        setTimeout(() => {
            isScrolling = false;
        }, 800);
    }

    // 初始化页面
    updatePageClasses();
    setupEventListeners();
}

// 初始化加载器和事件绑定，确保 DOM 渲染完成后再执行
window.addEventListener('DOMContentLoaded', function() {
    // 移动端优化：检查并添加必要的视口设置（只在移动端）
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }

        // 移动端优化：禁用文本选择和拖拽
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitTapHighlightColor = 'transparent';

        // 预连接到图片服务器
        const preconnectLinks = [
            'https://www.helloimg.com',
            'https://upload-bbs.miyoushe.com'
        ];
        
        preconnectLinks.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    const loader = new ResourceLoader();
    loader.startLoading();
});
