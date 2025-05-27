const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// 启用CORS
app.use(cors());

// QQ头像代理接口
app.get('/api/qq-avatar/:qq', async (req, res) => {
    const qq = req.params.qq;
    
    // 验证QQ号
    if (!/^\d{5,12}$/.test(qq)) {
        return res.status(400).json({ error: 'QQ号格式不正确' });
    }
    
    const avatarApis = [
        `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=640`,
        `https://q2.qlogo.cn/headimg_dl/${qq}/640`,
        `https://thirdqq.qlogo.cn/g?b=qq&nk=${qq}&s=640`
    ];
    
    // 尝试获取头像
    for (const url of avatarApis) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return res.json({
                    success: true,
                    avatar_url: url,
                    qq: qq
                });
            }
        } catch (error) {
            console.log(`API ${url} 失败:`, error.message);
        }
    }
    
    // 所有API都失败
    res.status(404).json({
        success: false,
        error: '无法获取QQ头像',
        qq: qq
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QQ头像代理服务运行在端口 ${PORT}`);
});

module.exports = app;
