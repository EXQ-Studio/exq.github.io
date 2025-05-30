// GitHub API 同步功能
let syncInProgress = false;
let commitData = [];

async function syncGitHub() {
    if (syncInProgress) return;

    const button = document.querySelector('.sync-button');
    const indicator = document.getElementById('statusIndicator');
    const status = document.getElementById('statusText');
    const repoInput = document.getElementById('repoInput');

    const repo = repoInput.value.trim();
    if (!repo) {
        updateStatus('error', '请输入有效的仓库地址');
        return;
    }

    syncInProgress = true;
    button.disabled = true;
    button.innerHTML = '<span>⏳</span>同步中...';
    updateStatus('loading', '正在获取最新数据...');    try {
        // 获取仓库信息（包含总提交数）
        updateStatus('loading', '正在获取仓库信息...');
        const repoResponse = await fetch(`https://api.github.com/repos/${repo}`);
        if (!repoResponse.ok) {
            throw new Error(`GitHub API 错误: ${repoResponse.status}`);
        }
        const repoInfo = await repoResponse.json();

        // 获取所有贡献者信息
        updateStatus('loading', '正在获取贡献者信息...');
        const contributorsResponse = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`);
        if (!contributorsResponse.ok) {
            throw new Error(`获取贡献者失败: ${contributorsResponse.status}`);
        }
        const contributors = await contributorsResponse.json();

        // 获取最近的提交数据用于统计
        updateStatus('loading', '正在获取提交记录...');
        const commitsResponse = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=100`);
        if (!commitsResponse.ok) {
            throw new Error(`获取提交记录失败: ${commitsResponse.status}`);
        }
        const commits = await commitsResponse.json();
        commitData = commits;

        // 更新统计数据
        updateStatus('loading', '正在处理数据...');
        updateStatistics(commits, repoInfo, contributors);

        // 更新图表
        updateCommitChart(commits);

        // 更新贡献者列表
        updateContributorsList(contributors);

        // 更新提交历史
        updateCommitHistory(commits);

        updateStatus('success', `同步成功！总计 ${repoInfo.size || 0}KB 代码，${contributors.length} 位贡献者`);} catch (error) {
        console.error('同步失败:', error);
        
        // 根据错误类型提供不同的处理建议
        let errorMessage = '同步失败: ';
        let suggestion = '';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += '网络连接失败';
            suggestion = '请检查网络连接或稍后重试';
        } else if (error.message.includes('404')) {
            errorMessage += '仓库不存在';
            suggestion = '请检查仓库地址是否正确';
        } else if (error.message.includes('403')) {
            errorMessage += 'API访问受限';
            suggestion = 'GitHub API访问频率限制，请稍后重试';
        } else if (error.message.includes('CORS')) {
            errorMessage += '跨域访问被阻止';
            suggestion = '请检查安全策略设置';
        } else {
            errorMessage += error.message;
            suggestion = '请稍后重试或联系技术支持';
        }
        
        updateStatus('error', `${errorMessage} - ${suggestion}`);
        
        // 为贡献者列表提供默认内容
        const contributorsContainer = document.querySelector('.contributors-list');
        if (contributorsContainer) {
            contributorsContainer.innerHTML = `
                <div style="color: #666; font-style: italic; padding: 10px;">
                    ⚠️ 无法加载贡献者信息，请稍后重试
                </div>
            `;
        }
    } finally {
        syncInProgress = false;
        button.disabled = false;
        button.innerHTML = '<span>🔄</span>同步更新';
    }
}

function updateStatus(type, message) {
    const indicator = document.getElementById('statusIndicator');
    const status = document.getElementById('statusText');

    if (!indicator || !status) {
        console.error('状态指示器元素未找到');
        return;
    }

    indicator.className = 'status-indicator';
    if (type === 'loading') {
        indicator.classList.add('status-loading');
    } else if (type === 'error') {
        indicator.classList.add('status-error');
    } else if (type === 'success') {
        indicator.classList.add('status-success');
    }

    status.textContent = message;
}

function updateStatistics(commits, repoInfo, contributors) {
    // 使用更精确的方法获取总提交数
    // 方法1: 尝试从最新提交的SHA获取准确数量（如果可用）
    // 方法2: 使用贡献者的提交总数相加
    let totalCommits = 0;
    
    // 计算所有贡献者的提交总数
    if (contributors && contributors.length > 0) {
        totalCommits = contributors.reduce((sum, contributor) => sum + contributor.contributions, 0);
    } else {
        // 如果无法获取贡献者数据，使用获取到的提交数作为最小值
        totalCommits = commits.length;
    }

    // 计算本周提交
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyCommits = commits.filter(commit =>
        new Date(commit.commit.author.date) > oneWeekAgo
    ).length;

    // 最后更新时间
    const lastCommitDate = commits[0] ? new Date(commits[0].commit.author.date) : new Date();
    const timeDiff = Math.floor((new Date() - lastCommitDate) / (1000 * 60 * 60 * 24));
    let lastUpdateText = timeDiff === 0 ? '今天' : timeDiff === 1 ? '昨天' : `${timeDiff}天前`;

    // 更新页面显示 - 显示精确的提交数
    document.getElementById('totalCommits').textContent = totalCommits.toLocaleString();
    document.getElementById('activeContributors').textContent = contributors.length;
    document.getElementById('lastUpdate').textContent = lastUpdateText;
    document.getElementById('weeklyCommits').textContent = weeklyCommits;
}

function updateContributorsList(contributors) {
    const contributorsContainer = document.querySelector('.contributors-list');
    if (!contributorsContainer) {
        console.error('找不到贡献者容器元素');
        return;
    }

    contributorsContainer.innerHTML = '';

    // 按贡献数量排序，取前10名
    const sortedContributors = contributors
        .sort((a, b) => b.contributions - a.contributions)
        .slice(0, 10);

    sortedContributors.forEach((contributor, index) => {
        const contributorElement = document.createElement('div');
        contributorElement.className = 'contributor';
        
        contributorElement.innerHTML = `
            <div class="contributor-avatar-container" style="position: relative; width: 32px; height: 32px;">
                <img src="${contributor.avatar_url}" 
                     alt="${contributor.login}" 
                     style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; display: block; background: none;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #667eea, #764ba2); color: white; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; position: absolute; top: 0; left: 0;">
                    ${contributor.login.charAt(0).toUpperCase()}
                </div>
            </div>
            <span style="margin-left: 8px;">${contributor.login}</span>
            <span style="font-size: 12px; color: #666; margin-left: auto;">${contributor.contributions} commits</span>
        `;

        contributorsContainer.appendChild(contributorElement);
    });
}

function updateCommitChart(commits) {
    const chartContainer = document.getElementById('commitChart');

    // 创建简单的提交活动图表
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
            date: date.toISOString().split('T')[0],
            commits: commits.filter(commit =>
                commit.commit.author.date.startsWith(date.toISOString().split('T')[0])
            ).length
        });
    }

    // 创建简单的条形图
    const maxCommits = Math.max(...last7Days.map(d => d.commits)) || 1;

    chartContainer.innerHTML = '';
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'end';
    chartContainer.style.justifyContent = 'space-around';
    chartContainer.style.padding = '20px';
    chartContainer.style.gap = '10px';

    last7Days.forEach((day, index) => {
        const bar = document.createElement('div');
        const height = Math.max((day.commits / maxCommits) * 150, 10);

        bar.style.width = '30px';
        bar.style.height = height + 'px';
        bar.style.background = `linear-gradient(to top, #667eea, #764ba2)`;
        bar.style.borderRadius = '4px 4px 0 0';
        bar.style.position = 'relative';
        bar.style.transition = 'all 0.3s ease';

        // 添加提示信息
        const tooltip = document.createElement('div');
        tooltip.textContent = `${day.commits} 提交`;
        tooltip.style.position = 'absolute';
        tooltip.style.bottom = '100%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.background = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease';

        const dayLabel = document.createElement('div');
        dayLabel.textContent = ['日', '一', '二', '三', '四', '五', '六'][new Date(day.date).getDay()];
        dayLabel.style.position = 'absolute';
        dayLabel.style.top = '100%';
        dayLabel.style.left = '50%';
        dayLabel.style.transform = 'translateX(-50%)';
        dayLabel.style.fontSize = '12px';
        dayLabel.style.marginTop = '5px';
        dayLabel.style.color = '#666';

        bar.appendChild(tooltip);
        bar.appendChild(dayLabel);

        bar.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
            bar.style.transform = 'scale(1.1)';
        });

        bar.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            bar.style.transform = 'scale(1)';
        });

        chartContainer.appendChild(bar);
    });
}

function updateCommitHistory(commits) {
    const updatesContainer = document.querySelector('.updates-container');
    if (!updatesContainer) return;

    // 创建临时容器存放新的更新
    const newUpdatesContainer = document.createElement('div');

    // 设置截止日期：2025年5月26日（因为25日及之前的更新已经在HTML中）
    const cutoffDate = new Date('2025-05-26');

    // 按日期对提交进行分组
    const commitsByDate = {};
    commits.forEach(commit => {
        const commitDate = new Date(commit.commit.author.date);
        
        // 只处理截止日期之后的提交
        if (commitDate <= cutoffDate) {
            return;
        }

        // 过滤无意义的提交信息
        const message = commit.commit.message;
        if (shouldFilterCommit(message)) {
            return;
        }

        const dateKey = commitDate.toISOString().split('T')[0];
        if (!commitsByDate[dateKey]) {
            commitsByDate[dateKey] = [];
        }
        commitsByDate[dateKey].push(commit);
    });

    // 按日期降序排序
    const sortedDates = Object.keys(commitsByDate).sort((a, b) => b.localeCompare(a));

    // 创建更新卡片
    sortedDates.forEach(dateKey => {
        const dateCommits = commitsByDate[dateKey];
        const date = new Date(dateKey);
        
        // 如果这个日期没有有效的提交，跳过
        if (dateCommits.length === 0) return;

        const card = document.createElement('div');
        card.className = 'update-card';
        
        // 格式化日期
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        
        // 过滤和美化提交消息
        const commitMessages = dateCommits.map(commit => {
            let message = commit.commit.message
                .split('\n')[0] // 只取第一行
                .trim()
                .replace(/^[Uu]pdate:?\s*/, '') // 移除开头的Update
                .replace(/^[Ff]ix:?\s*/, '') // 移除开头的Fix
                .replace(/^\[.*?\]\s*/, '') // 移除方括号标签
                .replace(/^[0-9.]+$/, '') // 移除纯数字和小数点
                .replace(/^v?\d+\.\d+(\.\d+)?$/, '') // 移除版本号格式
                .trim();

            // 确保首字母大写
            if (message.length > 0) {
                message = message.charAt(0).toUpperCase() + message.slice(1);
            }
            
            return message;
        }).filter(msg => {
            // 过滤条件：
            // 1. 消息长度至少5个字符
            // 2. 不是纯数字或符号
            // 3. 不是无意义的短语
            return msg.length >= 5 && 
                   !/^\d+$/.test(msg) && 
                   !isCommonMeaningless(msg);
        });

        // 如果没有有效的提交消息，跳过这个日期
        if (commitMessages.length === 0) return;

        card.innerHTML = `
            <div class="update-date">${formattedDate}</div>
            <div class="update-content">
                ${commitMessages.map(msg => `
                    <div class="update-item">${msg}</div>
                `).join('')}
            </div>
        `;
        
        newUpdatesContainer.appendChild(card);
    });

    // 只有在有新的更新时才修改页面
    if (newUpdatesContainer.children.length > 0) {
        // 在原有内容之前插入新的更新
        const firstExistingCard = updatesContainer.querySelector('.update-card');
        if (firstExistingCard) {
            firstExistingCard.insertAdjacentHTML('beforebegin', newUpdatesContainer.innerHTML);
        }
    }
}

// 判断是否应该过滤掉这个提交
function shouldFilterCommit(message) {
    const lowerMessage = message.toLowerCase();
    
    // 基本过滤规则
    if (lowerMessage.includes('merge') ||
        lowerMessage.includes('initial commit') ||
        lowerMessage.trim().length < 5 ||
        lowerMessage.includes('.gitignore') ||
        lowerMessage.includes('readme')) {
        return true;
    }

    // 过滤纯数字、版本号等
    if (/^[0-9.]+$/.test(message) || // 纯数字和小数点
        /^v?\d+\.\d+(\.\d+)?$/.test(message) || // 版本号格式
        /^\d+$/.test(message)) { // 纯数字
        return true;
    }

    // 过滤简单的无意义更新信息
    const meaninglessUpdates = [
        'update',
        'fix',
        'test',
        'temp',
        'tmp',
        'wip',
        'todo',
        'done',
        'ok'
    ];

    return meaninglessUpdates.some(word => 
        lowerMessage === word || 
        lowerMessage === word + 's' || 
        lowerMessage.startsWith(word + ':') || 
        lowerMessage.startsWith(word + ' '));
}

// 检查是否是常见的无意义短语
function isCommonMeaningless(message) {
    const meaninglessPatterns = [
        /^just /i,
        /^temp/i,
        /^test/i,
        /^wip/i,
        /^todo/i,
        /^done/i,
        /^ok/i,
        /^quick /i,
        /^minor /i,
        /^small /i,
        /^tiny /i,
        /^misc /i
    ];

    return meaninglessPatterns.some(pattern => pattern.test(message));
}

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', function () {
    console.log('EXQ Studio 更新日志页面已加载');
});