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
        // 获取提交数据
        const commitsResponse = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=100`);

        if (!commitsResponse.ok) {
            throw new Error(`GitHub API 错误: ${commitsResponse.status}`);
        }

        const commits = await commitsResponse.json();
        commitData = commits;

        // 获取仓库信息
        const repoResponse = await fetch(`https://api.github.com/repos/${repo}`);
        const repoInfo = await repoResponse.json();

        // 更新统计数据
        updateStatistics(commits, repoInfo);

        // 更新图表
        updateCommitChart(commits);

        updateStatus('success', `同步成功！获取到 ${commits.length} 条最新提交`);

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

function updateStatistics(commits, repoInfo) {
    // 统计数据
    const totalCommits = commits.length;
    const contributors = [...new Set(commits.map(commit => commit.author?.login).filter(Boolean))];

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

    // 更新页面显示
    document.getElementById('totalCommits').textContent = totalCommits + '+';
    document.getElementById('activeContributors').textContent = contributors.length;
    document.getElementById('lastUpdate').textContent = lastUpdateText;
    document.getElementById('weeklyCommits').textContent = weeklyCommits;
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
    // 可以在这里添加自动同步逻辑
    console.log('EXQ Studio 更新日志页面已加载');
});