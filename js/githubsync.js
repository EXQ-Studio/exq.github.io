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
    updateStatus('loading', '正在获取最新数据...');

    try {
        // 获取仓库信息（包含总提交数）
        const repoResponse = await fetch(`https://api.github.com/repos/${repo}`);
        if (!repoResponse.ok) {
            throw new Error(`GitHub API 错误: ${repoResponse.status}`);
        }
        const repoInfo = await repoResponse.json();

        // 获取所有贡献者信息
        const contributorsResponse = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`);
        if (!contributorsResponse.ok) {
            throw new Error(`获取贡献者失败: ${contributorsResponse.status}`);
        }
        const contributors = await contributorsResponse.json();

        // 获取最近的提交数据用于统计
        const commitsResponse = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=100`);
        if (!commitsResponse.ok) {
            throw new Error(`获取提交记录失败: ${commitsResponse.status}`);
        }
        const commits = await commitsResponse.json();
        commitData = commits;

        // 更新统计数据
        updateStatistics(commits, repoInfo, contributors);

        // 更新图表
        updateCommitChart(commits);

        // 更新贡献者列表
        updateContributorsList(contributors);

        updateStatus('success', `同步成功！总计 ${repoInfo.size || 0}KB 代码，${contributors.length} 位贡献者`);

    } catch (error) {
        console.error('同步失败:', error);
        updateStatus('error', `同步失败: ${error.message}`);
    } finally {
        syncInProgress = false;
        button.disabled = false;
        button.innerHTML = '<span>🔄</span>同步更新';
    }
}

function updateStatus(type, message) {
    const indicator = document.getElementById('statusIndicator');
    const status = document.getElementById('statusText');

    indicator.className = 'status-indicator';
    if (type === 'error') {
        indicator.classList.add('status-error');
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
    if (!contributorsContainer) return;

    contributorsContainer.innerHTML = '';

    // 按贡献数量排序，取前10名
    const sortedContributors = contributors
        .sort((a, b) => b.contributions - a.contributions)
        .slice(0, 10);

    sortedContributors.forEach(contributor => {
        const contributorElement = document.createElement('div');
        contributorElement.className = 'contributor';
        
        contributorElement.innerHTML = `
            <div class="contributor-avatar" style="position: relative;">
                <img src="${contributor.avatar_url}" 
                     alt="${contributor.login}" 
                     style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #667eea, #764ba2); color: white; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                    ${contributor.login.charAt(0).toUpperCase()}
                </div>
            </div>
            <span>${contributor.login}</span>
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

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', function () {
    console.log('EXQ Studio 更新日志页面已加载');
});