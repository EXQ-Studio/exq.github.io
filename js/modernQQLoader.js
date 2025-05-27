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

// 调试功能：检查页面结构和QQ配置匹配
function debugPageStructure() {
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
                    console.log(`⏰ QQ头像加载超时 - 页面${pageIndex} (QQ:${qqNumber})，保持原图`);
                    
                    // 超时也通知资源加载器
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
                    console.log(`✅ 成功加载QQ头像 - 页面${pageIndex} (QQ:${qqNumber})`);
                    
                    // 如果有资源加载器，通知加载完成
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
                    console.log(`❌ QQ头像加载失败 - 页面${pageIndex} (QQ:${qqNumber})，保持原图`);
                    
                    // 即使失败也通知资源加载器
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
                originalStartLoading.call(this);
                
                // 添加QQ头像资源
                Object.entries(QQ_NUMBERS).forEach(([pageIndex, qqNumber]) => {
                    this.addResource(`qq-avatar-${pageIndex}`);
                });
                
                // 更新当前资源文本
                if (this.isLoading) {
                    this.loadingCurrentResource.textContent = '开始加载QQ头像...';
                }
                
                // 开始加载QQ头像
                this.loadQQAvatars();
            };
            
            // 添加QQ头像加载方法
            ResourceLoader.prototype.loadQQAvatars = function() {
                Object.entries(QQ_NUMBERS).forEach(([pageIndex, qqNumber]) => {
                    loadMemberAvatar(parseInt(pageIndex), qqNumber, this);
                });
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
    console.log('🚀 开始加载QQ头像...');
    
    const promises = [];
    
    // 为每个成员创建加载任务
    Object.entries(QQ_NUMBERS).forEach(([pageIndex, qqNumber]) => {
        promises.push(loadMemberAvatar(parseInt(pageIndex), qqNumber));
    });
    
    // 等待所有头像加载完成
    const results = await Promise.allSettled(promises);
    
    // 统计结果
    const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
    const total = results.length;
    
    console.log(`📊 头像加载完成: ${successful}/${total} 成功`);
    
    if (successful === total) {
        console.log('🎉 所有QQ头像加载成功！');
    } else if (successful > 0) {
        console.log('⚠️ 部分QQ头像加载成功，其他保持原图');
    } else {
        console.log('❌ 所有QQ头像都加载失败，保持原图');
    }
    
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
    console.log(`✏️ 更新页面${pageIndex}的QQ号为: ${newQQ}`);
    await loadMemberAvatar(pageIndex, newQQ);
};

console.log('📋 现代化QQ头像加载器已准备就绪');
console.log('💡 命令: reloadQQAvatars() - 重新加载所有头像');
console.log('💡 命令: updateMemberQQ(页面序号, QQ号) - 更新指定成员');
