// 现代化简单QQ头像加载器
// 使用最新的web技术，但保持简单易懂

const QQ_NUMBERS = {
    // 注意：页面0是"关于我们"介绍页，不需要QQ头像
    1: '1709075785',  // 页面1: Disunited (创始人/站长)
    2: '2642751802',  // 页面2: 咕咕十三awa (副站长)
    3: '3274095289',  // 页面3: Jared (经理/服务器提供)
    4: '1458628596',  // 页面4: Vilian (运维部长/后端)
    5: '1739481885',  // 页面5: D某人00 (网站设计/排版)
    6: '462914673',   // 页面6: Orange (前端/后端)
    7: '2608237844'   // 页面7: ZyEternity (顾问)
};

// 获取QQ头像URL
function getQQAvatarUrl(qqNumber) {
    return `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=640`;
}

// 调试功能：检查页面结构和QQ配置匹配（仅在开发模式下启用）
function debugPageStructure() {
    if (typeof DEBUG !== 'undefined' && DEBUG) {
        console.log('🔍 调试页面结构：');
        const pages = document.querySelectorAll('.page');
        
        pages.forEach((page, index) => {
            const title = page.querySelector('h1')?.textContent || '无标题';
            const img = page.querySelector('.card img');
            const qqNumber = QQ_NUMBERS[index];
            
            console.log(`页面${index}: ${title}`);
            console.log(`  - 是否有图片: ${img ? '✅' : '❌'}`);
            console.log(`  - 配置的QQ号: ${qqNumber || '无'}`);
            console.log(`  - 当前图片源: ${img?.src || '无'}`);
            console.log('---');
        });
    }
}

// 后台异步加载单个头像（不影响主加载进度）
async function loadMemberAvatarBackground(pageIndex, qqNumber) {
    try {
        const pages = document.querySelectorAll('.page');
        const targetPage = pages[pageIndex];
        
        if (!targetPage) {
            // 页面不存在时静默处理
            return false;
        }
        
        const img = targetPage.querySelector('.card img');
        if (!img) {
            // 图片元素不存在时静默处理
            return false;
        }
        
        const avatarUrl = getQQAvatarUrl(qqNumber);
        
        return new Promise((resolve) => {
            const testImg = new Image();
            let isResolved = false;
            
            // 设置5秒超时
            const timeout = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    // 超时时静默处理，保持原图
                    resolve(false);
                }
            }, 5000);
            
            testImg.onload = () => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeout);
                    img.src = avatarUrl;
                    // 静默处理成功加载
                    resolve(true);
                }
            };
            
            testImg.onerror = () => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeout);
                    // 静默处理加载失败，保持原图
                    resolve(false);
                }
            };
            
            testImg.src = avatarUrl;
        });
        
    } catch (error) {
        console.error(`❌ 后台加载页面${pageIndex}头像时出错:`, error);
        return false;
    }
}

// 异步加载单个头像（集成到主加载系统）
async function loadMemberAvatar(pageIndex, qqNumber, resourceLoader = null) {
    try {
        // 查找对应的图片元素
        const pages = document.querySelectorAll('.page');
        const targetPage = pages[pageIndex];
        
        if (!targetPage) {
            console.log(`⚠️ 页面${pageIndex}不存在`);
            return false;
        }
        
        const img = targetPage.querySelector('.card img');
        if (!img) {
            console.log(`⚠️ 页面${pageIndex}没有找到图片元素`);
            return false;
        }
        
        const avatarUrl = getQQAvatarUrl(qqNumber);
          // 使用Promise来处理图片加载，添加超时机制
        return new Promise((resolve) => {
            const testImg = new Image();
            let isResolved = false;
            
            // 设置5秒超时
            const timeout = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    // 超时时静默处理，通知资源加载器
                    if (resourceLoader) {
                        resourceLoader.handleResourceError(`qq-avatar-${pageIndex}`);
                    }
                    resolve(false);
                }
            }, 5000);
            
            testImg.onload = () => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeout);
                    img.src = avatarUrl;
                    // 成功加载时静默处理
                    if (resourceLoader) {
                        resourceLoader.handleResourceLoad(`qq-avatar-${pageIndex}`);
                    }
                    resolve(true);
                }
            };
            
            testImg.onerror = () => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeout);
                    // 加载失败时静默处理
                    if (resourceLoader) {
                        resourceLoader.handleResourceError(`qq-avatar-${pageIndex}`);
                    }
                    resolve(false);
                }
            };
            
            // 开始加载测试
            testImg.src = avatarUrl;
        });
        
    } catch (error) {
        console.error(`❌ 加载页面${pageIndex}头像时出错:`, error);
        
        // 发生错误时也通知资源加载器
        if (resourceLoader) {
            resourceLoader.handleResourceError(`qq-avatar-${pageIndex}`);
        }
        
        return false;
    }
}

// 将QQ头像加载集成到主加载系统
function integrateQQLoadingToMainSystem() {
    // 等待ResourceLoader类可用
    const checkResourceLoader = () => {
        if (typeof ResourceLoader !== 'undefined') {
            // 扩展ResourceLoader类，添加QQ头像加载
            const originalStartLoading = ResourceLoader.prototype.startLoading;
              ResourceLoader.prototype.startLoading = function() {
                // 调用原始的startLoading
                originalStartLoading.call(this);                // QQ头像加载策略：完全后台加载，不计入主要资源
                // 异步在后台加载QQ头像（不计入主要资源数量）
                setTimeout(() => {
                    this.loadQQAvatarsAsync();
                }, 100);
            };
              // 添加异步QQ头像加载方法
            ResourceLoader.prototype.loadQQAvatarsAsync = async function() {
                // 静默后台加载QQ头像
                const promises = [];
                
                Object.entries(QQ_NUMBERS).forEach(([pageIndex, qqNumber]) => {
                    promises.push(loadMemberAvatarBackground(parseInt(pageIndex), qqNumber));
                });
                
                try {
                    const results = await Promise.allSettled(promises);
                    // 静默处理结果，不输出日志
                } catch (error) {
                    // 静默处理错误
                }
            };
            
        } else {
            // 如果ResourceLoader还不可用，100ms后再试
            setTimeout(checkResourceLoader, 100);
        }
    };
    
    checkResourceLoader();
}

// 加载所有成员头像
async function loadAllAvatars() {
    // 静默加载所有QQ头像
    const promises = [];
    
    // 为每个成员创建加载任务
    Object.entries(QQ_NUMBERS).forEach(([pageIndex, qqNumber]) => {
        promises.push(loadMemberAvatar(parseInt(pageIndex), qqNumber));
    });
    
    // 等待所有头像加载完成
    const results = await Promise.allSettled(promises);
    
    // 统计结果但不输出详细日志
    const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
    const total = results.length;
    
    return { successful, total };
}

// DOM加载完成后集成到主加载系统
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', integrateQQLoadingToMainSystem);
} else {
    integrateQQLoadingToMainSystem();
}

// 提供手动重新加载功能
window.reloadQQAvatars = loadAllAvatars;

// 提供单独更新功能
window.updateMemberQQ = async (pageIndex, newQQ) => {
    QQ_NUMBERS[pageIndex] = newQQ;
    // 静默更新QQ号并加载新头像
    await loadMemberAvatar(pageIndex, newQQ);
};

// 现代化QQ头像加载器已准备就绪（静默模式）
