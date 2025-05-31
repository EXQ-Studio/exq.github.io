// 添加加载页面到 DOM
document.addEventListener('DOMContentLoaded', function() {
    // 确保body存在后再添加加载界面
    if (document.body) {
        addLoadingInterface();
    }
});

function addLoadingInterface() {
    // 检查是否已经添加过加载界面
    if (document.querySelector('.loading-container')) {
        return;
    }
    
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
                <div class="loading-text">正在加载团队资源</div>
                <div class="loading-current-resource">正在初始化...</div>
                <div class="loading-stats">
                    <span class="loaded-count">0</span> / <span class="total-count">0</span> 个资源
                </div>
            </div>
        </div>
    `);
}

// 资源加载管理
class ResourceLoader {
    constructor() {
        // 等待DOM元素可用
        this.initElements();
        this.resources = new Set();
        this.loadedResources = new Set();
        this.totalResources = 0;
        this.isLoading = true;
        this.loadingTimeout = null;
    }

    initElements() {
        // 等待加载界面元素可用
        const waitForElements = () => {
            this.loadingContainer = document.querySelector('.loading-container');
            this.progressBar = document.querySelector('.progress-bar');
            this.progressPercentage = document.querySelector('.progress-percentage');
            this.loadingCurrentResource = document.querySelector('.loading-current-resource');
            this.loadedCountElement = document.querySelector('.loaded-count');
            this.totalCountElement = document.querySelector('.total-count');
            this.pages = document.querySelector('.pages');

            // 如果关键元素还不可用，等待一段时间后重试
            if (!this.loadingContainer || !this.pages) {
                console.log('Waiting for elements...', {
                    loadingContainer: !!this.loadingContainer,
                    pages: !!this.pages
                });
                setTimeout(waitForElements, 50);
                return;
            }
            console.log('All elements ready!');
        };
        waitForElements();
    }

    // 添加需要加载的资源
    addResource(resource) {
        if (!this.resources.has(resource)) {
            this.resources.add(resource);
            this.totalResources++;
            // 更新总数显示
            if (this.totalCountElement) {
                this.totalCountElement.textContent = this.totalResources;
            }
        }
    }

    // 更新加载进度
    updateProgress() {
        // 更新已加载计数
        if (this.loadedCountElement) {
            this.loadedCountElement.textContent = this.loadedResources.size;
        }

        if (this.totalResources === 0) {
            if (this.progressBar) this.progressBar.style.width = '100%';
            if (this.progressPercentage) this.progressPercentage.textContent = '100%';
            if (this.isLoading) {
                if (this.loadingCurrentResource) this.loadingCurrentResource.textContent = '未找到需加载的资源';
                this.completeLoading();
            }
            return;
        }

        const progress = Math.min(100, Math.round((this.loadedResources.size / this.totalResources) * 100));
        
        // 更新进度条
        if (this.progressBar) this.progressBar.style.width = `${progress}%`;
        if (this.progressPercentage) this.progressPercentage.textContent = `${progress}%`;

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
        if (this.progressBar) this.progressBar.style.width = '100%';
        if (this.progressPercentage) this.progressPercentage.textContent = '100%';
        if (this.loadingCurrentResource) this.loadingCurrentResource.textContent = '加载完成!';

        // 强制显示一段时间，让用户能看到100%的状态
        setTimeout(() => {
            if (this.loadingContainer) this.loadingContainer.style.opacity = '0';
            setTimeout(() => {
                if (this.loadingContainer) this.loadingContainer.style.display = 'none';
                // 显示页面内容
                if (this.pages) this.pages.style.display = 'flex';
                // 使用 requestAnimationFrame 确保 DOM 更新
                requestAnimationFrame(() => {
                    if (this.pages) this.pages.classList.add('loaded');
                    // 初始化页面
                    initializePages();
                });
            }, 600);
        }, 1500); // 增加显示时间，让用户能看到完成状态
    }    // 处理资源加载完成（减少延迟以加快加载）
    handleResourceLoad(resource) {
        console.log(`✅ Resource loaded: ${resource}`);
        // 立即处理，不添加延迟
        this.loadedResources.add(resource);
        // 更新当前加载的资源文本
        if (this.isLoading && this.loadingCurrentResource) {
            this.loadingCurrentResource.textContent = `已加载: ${this.getFriendlyResourceName(resource)}`;
        }
        this.updateProgress();
    }    // 处理资源加载失败（减少延迟以加快加载）
    handleResourceError(resource) {
        console.warn(`❌ Failed to load resource: ${resource}`);
        // 立即处理，不添加延迟
        this.loadedResources.add(resource); // 即使失败也计入进度
        // 更新当前加载的资源文本（即使失败）
        if (this.isLoading && this.loadingCurrentResource) {
            this.loadingCurrentResource.textContent = `加载失败: ${this.getFriendlyResourceName(resource)}`;
        }
        this.updateProgress();
    }    // 获取更友好的资源名称用于显示
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
        // 等待元素就绪
        const checkAndStart = () => {
            if (!this.pages || !this.loadingCurrentResource) {
                console.log('Elements not ready, waiting...');
                setTimeout(checkAndStart, 100);
                return;
            }

            console.log('Starting resource loading...');
            
            // 确保页面初始状态
            this.pages.style.display = 'none';
            this.pages.classList.remove('loaded');
            this.loadingCurrentResource.textContent = '扫描资源中...'; // 设置初始扫描信息            // 添加所有图片资源（区分本地和外部资源）
            const images = document.querySelectorAll('img');
            console.log(`Found ${images.length} images`);            images.forEach(img => {
                // 检查是否为外部资源（非本站域名的http/https链接）
                const isExternal = img.src.startsWith('http') && !img.src.includes(window.location.hostname);
                
                if (isExternal) {
                    // 外部图片：不添加到主加载流程，完全后台处理
                    console.log(`External image (background loading): ${img.src}`);
                    
                    // 异步加载外部图片（不计入主要资源）
                    const tempImg = new Image();
                    tempImg.onload = () => console.log(`✅ External image loaded: ${img.src}`);
                    tempImg.onerror = () => console.log(`❌ External image failed: ${img.src}`);
                    tempImg.src = img.src;
                } else {
                    // 本地图片：正常加载流程
                    this.addResource(img.src);
                    if (img.complete && img.naturalHeight !== 0) {
                        this.handleResourceLoad(img.src);
                    } else {
                        img.addEventListener('load', () => this.handleResourceLoad(img.src));
                        img.addEventListener('error', () => this.handleResourceError(img.src));
                    }
                }
            });

            // 添加所有样式表
            const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            console.log(`Found ${stylesheets.length} stylesheets`);
            stylesheets.forEach(link => {
                this.addResource(link.href);
                if (link.sheet) {
                    this.handleResourceLoad(link.href);
                } else {
                    link.addEventListener('load', () => this.handleResourceLoad(link.href));
                    link.addEventListener('error', () => this.handleResourceError(link.href));
                }
            });

            // 添加所有脚本
            const scripts = document.querySelectorAll('script');
            console.log(`Found ${scripts.length} scripts`);
            scripts.forEach(script => {
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

            console.log(`Found ${this.totalResources} resources to load`);

            // 检查是否有资源需要加载
            if (this.totalResources === 0) {
                console.log("No resources found to load.");
                // updateProgress 会处理后续的 completeLoading 调用
                this.updateProgress(); // 这会触发 totalResources === 0 的逻辑
                return;            } else {
                this.loadingCurrentResource.textContent = '开始加载资源...';
            }

            // 设置较短的超时保护
            this.loadingTimeout = setTimeout(() => {
                if (this.isLoading) {
                    console.warn('Loading timeout reached, forcing completion');
                    console.log(`Loaded ${this.loadedResources.size} of ${this.totalResources} resources`);
                    if (this.loadingCurrentResource) this.loadingCurrentResource.textContent = '加载完成';
                    this.completeLoading();
                }
            }, 6000); // 减少到6秒超时
            
            // 添加快速完成检测 - 如果2秒后还有很多资源未加载，可能是网络问题
            setTimeout(() => {
                if (this.isLoading && this.loadedResources.size < this.totalResources * 0.7) {
                    console.log('检测到可能的网络延迟，启用快速完成模式');
                    // 标记所有未加载的资源为已加载
                    this.resources.forEach(resource => {
                        if (!this.loadedResources.has(resource)) {
                            console.log(`快速标记: ${resource}`);
                            this.loadedResources.add(resource);
                        }
                    });
                    if (this.loadingCurrentResource) this.loadingCurrentResource.textContent = '网络优化完成';
                    this.updateProgress();
                }
            }, 2000);
        };

        checkAndStart();
    }
}

// 页面初始化
function initializePages() {
    const pages = document.querySelectorAll('.page');
    let currentPage = 0;
    let isScrolling = false;    function updatePageClasses() {
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
        
        // 控制返回第一页按钮的显示/隐藏
        updateBackToHomeButton();
    }    function updateBackToHomeButton() {
        const backButton = document.querySelector('#back-to-home');
        if (backButton) {
            if (currentPage === 0) {
                // 在第一页时隐藏按钮 - 使用淡出动画
                if (backButton.classList.contains('show')) {
                    backButton.classList.remove('show', 'animate-in');
                    backButton.classList.add('animate-out');
                    
                    // 动画结束后隐藏元素
                    setTimeout(() => {
                        if (currentPage === 0) { // 确保仍在第一页
                            backButton.style.display = 'none';
                            backButton.classList.remove('animate-out');
                        }
                    }, 400);
                } else {
                    backButton.style.display = 'none';
                }
            } else {
                // 从第二页开始显示按钮 - 使用滑入动画
                if (backButton.style.display === 'none') {
                    backButton.style.display = 'block';
                    backButton.classList.remove('animate-out');
                    backButton.classList.add('animate-in', 'show');
                    
                    // 动画结束后移除动画类
                    setTimeout(() => {
                        backButton.classList.remove('animate-in');
                    }, 600);
                } else if (!backButton.classList.contains('show')) {
                    backButton.classList.add('show');
                }
            }
        }
    }    function setupEventListeners() {
        // 鼠标滚轮事件
        document.querySelector('.pages').addEventListener('wheel', handleWheel);

        // 触摸事件（改进的移动端支持）
        if (window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            let touchStartY = 0;
            let touchStartX = 0;
            let touchStartTime = 0;
            let isTouching = false;
            let lastChangePage = 0;

            const pagesElement = document.querySelector('.pages');
            
            pagesElement.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                touchStartTime = Date.now();
                isTouching = true;
                console.log('Touch start:', touchStartY);
            }, { passive: true });

            pagesElement.addEventListener('touchmove', (e) => {
                if (!isTouching) return;
                
                const touchCurrentY = e.touches[0].clientY;
                const touchCurrentX = e.touches[0].clientX;
                const deltaY = touchStartY - touchCurrentY;
                const deltaX = touchStartX - touchCurrentX;
                
                // 只处理垂直滑动，且滑动距离足够
                if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
                    e.preventDefault();
                    console.log('Touch move deltaY:', deltaY);
                }
            }, { passive: false });

            pagesElement.addEventListener('touchend', (e) => {
                if (!isTouching) return;
                
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaY = touchStartY - touchEndY;
                const now = Date.now();
                
                console.log('Touch end - deltaY:', deltaY, 'duration:', touchDuration, 'isScrolling:', isScrolling);
                
                // 防止频繁切换页面
                if (now - lastChangePage < 800) {
                    isTouching = false;
                    return;
                }
                
                // 判断滑动方向和距离
                if (Math.abs(deltaY) > 50 && !isScrolling) {
                    if (deltaY > 0 && currentPage < pages.length - 1) {
                        // 向上滑动，下一页
                        console.log('Next page');
                        changePage(1);
                        lastChangePage = now;
                    } else if (deltaY < 0 && currentPage > 0) {
                        // 向下滑动，上一页
                        console.log('Previous page');
                        changePage(-1);
                        lastChangePage = now;
                    }
                }
                
                isTouching = false;
            }, { passive: true });

            // 阻止双击缩放
            pagesElement.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }

        // 返回按钮事件
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

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 移动端优化
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }

        // 移动端优化：禁用文本选择和拖拽
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitTapHighlightColor = 'transparent';        // 预连接到外部图片服务器
        const preconnectLinks = [
            'https://upload-bbs.miyoushe.com',
            'https://q1.qlogo.cn'
        ];
        
        preconnectLinks.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    // 等待一小段时间确保所有元素都已就绪，然后开始加载
    setTimeout(() => {
        const loader = new ResourceLoader();
        loader.startLoading();
    }, 100);
});
