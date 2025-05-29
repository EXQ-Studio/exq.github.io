# 📁 EXQ Studio 项目文件用途说明
## ==========================================

**文档生成时间**: 2025年5月29日  
**项目版本**: v3.0 Final  
**项目状态**: ✅ 已完成安全优化  

## 🏠 根目录核心文件

### 📄 HTML 页面文件
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `index.html` | 网站首页 | 主页面，包含网站介绍、特色功能展示 |
| `about.html` | 关于团队页面 | 团队介绍、成员信息、发展历程 |
| `download.html` | 下载页面 | 病毒样本下载，包含安全警告和使用说明 |
| `donation.html` | 赞助页面 | 支持项目发展的赞助渠道 |
| `recentupdate.html` | 更新日志 | 最近更新内容和版本历史 |
| `404.html` | 错误页面 | 自定义404错误页面 |

### 🔧 配置文件
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `.htaccess` | Apache服务器配置 | 安全头部、重定向、文件保护等安全配置 |
| `CNAME` | GitHub Pages域名配置 | 指定自定义域名 exqstudio.cn |
| `robots.txt` | 搜索引擎爬虫指令 | 控制搜索引擎抓取行为 |
| `sitemap.xml` | 网站地图 | 帮助搜索引擎索引网站内容 |
| `BingSiteAuth.xml` | Bing站长验证 | 必应搜索引擎站点验证文件 |
| `structured-data.json` | 结构化数据 | SEO优化和富媒体搜索结果 |

### 📖 文档文件
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `README.md` | 项目说明文档 | GitHub仓库主要说明文件 |
| `EXQ-Studio-Security-Project-Final-Report.md` | 安全项目报告 | 安全评估和优化项目的完整报告 |
| `File-Cleanup-Report.md` | 文件清理报告 | 项目文件整理和清理记录 |

## 🛡️ 安全相关文件

### 🔍 安全评估工具
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `security-assessment-final.ps1` | 综合安全评估脚本 | PowerShell脚本，执行全面安全检查 |
| `performance-impact-test.ps1` | 性能影响评估工具 | 测试安全措施对网站性能的影响 |
| `security-dashboard-v2.html` | 安全监控面板 | 实时安全状态监控界面 |

### 📊 评估结果文件
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `security-assessment-20250529-205321.json` | 安全评估结果 | 详细的安全评分和检测结果 (81/100分) |
| `performance-assessment-20250529-205424.json` | 性能评估结果 | 网站性能测试数据 (100%成功率) |

### 🔒 备份目录
| 目录名 | 用途 | 说明 |
|--------|------|------|
| `security-backup-20250529-202617/` | 安全备份 | 安全修复前的文件备份 |

## 🎨 前端资源文件

### 🎨 样式文件 (css/)
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `style.css` | 主样式文件 | 网站主要样式定义 |
| `404.css` | 错误页面样式 | 404页面专用样式 |
| `about.css` | 关于页面样式 | 团队介绍页面样式 |
| `download.css` | 下载页面样式 | 下载页面布局和样式 |
| `donation.css` | 赞助页面样式 | 赞助页面专用样式 |
| `recentupdate.css` | 更新页面样式 | 更新日志页面样式 |
| `animations.css` | 动画效果样式 | 网站动画和过渡效果 |
| `reset.css` | 样式重置文件 | 浏览器默认样式重置 |
| `utilities.css` | 工具类样式 | 通用工具类和辅助样式 |
| `variables.css` | CSS变量定义 | 颜色、尺寸等变量定义 |

### 🎯 JavaScript文件 (js/)
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `index.js` | 首页交互脚本 | 首页功能和交互逻辑 |
| `download.js` | 下载页面脚本 | 下载页面弹窗和交互 |
| `nav.js` | 导航栏脚本 | 响应式导航菜单控制 |
| `page.js` | 页面通用脚本 | 页面通用功能和工具函数 |
| `banner.js` | 横幅广告脚本 | 广告横幅显示控制 |
| `githubsync.js` | GitHub同步脚本 | GitHub数据同步功能 |
| `modernQQLoader.js` | QQ头像加载器 | 现代化QQ头像加载组件 |

### 🖼️ 图片资源 (img/)
| 目录/文件 | 用途 | 说明 |
|-----------|------|------|
| `logo/` | Logo图片目录 | 包含各种规格的Logo文件 |
| `├── LogoEXQStudio.png` | 主Logo | 完整版EXQ Studio标志 |
| `├── LogoIcon.png` | 图标Logo | 网站图标和favicon |
| `├── LogoNavBar.png` | 导航栏Logo | 导航栏专用Logo |
| `└── LogoNavBarForums.png` | 论坛Logo | 论坛页面专用Logo |
| `avatar/` | 头像图片目录 | 用户头像示例图片 (1.jpg ~ 7.jpg) |
| `bg.png` | 背景图片 | 网站主背景图 |
| `bgDownload.jpg` | 下载页背景 | 下载页面桌面版背景 |
| `bgDownloadMobile.jpg` | 下载页移动背景 | 下载页面移动版背景 |
| `bgPageError.png` | 错误页背景 | 404页面背景图 |
| `Aether.png` | 角色图片 | 游戏角色Aether |
| `Lumine.png` | 角色图片 | 游戏角色Lumine |
| `老板的收款码.png` | 收款码 | 赞助页面收款二维码 |

### 🔤 字体文件 (font/)
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `站酷文艺体.ttf` | 中文艺术字体 | 用于标题和装饰文字 |
| `STXingkai.ttf` | 行楷字体 | 中文书法风格字体 |

## 🧩 模板文件 (template/)
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `navbar.html` | 导航栏模板 | 可复用的导航栏HTML结构 |
| `navbar.css` | 导航栏样式 | 导航栏专用样式文件 |
| `footer.html` | 页脚模板 | 可复用的页脚HTML结构 |
| `footer.css` | 页脚样式 | 页脚专用样式文件 |

## 🔧 API 后端文件 (api/)
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `qq-avatar.php` | QQ头像API | 基础QQ头像获取接口 |
| `qq-avatar-secure.php` | 安全QQ头像API | 带安全验证的头像接口 |
| `qq-avatar-secure-v2.php` | QQ头像API v2 | 增强版安全头像接口 |
| `qq-avatar-server.js` | Node.js头像服务 | JavaScript版本头像服务 |
| `rate-limiter.php` | 访问频率限制 | API访问频率控制中间件 |
| `security-monitor.php` | 安全监控API | 安全状态监控接口 |
| `security-status.php` | 安全状态API | 获取实时安全状态数据 |

## 🎮 CoreBox 项目 (CoreBox/)
| 文件名 | 用途 | 说明 |
|--------|------|------|
| `corebox.html` | CoreBox主页 | 工具箱项目主页面 |
| `corebox.css` | CoreBox样式 | 工具箱页面样式 |
| `historyversion.html` | 历史版本页 | CoreBox版本历史 |
| `historyversion.css` | 历史版本样式 | 版本页面样式 |
| `fonts/font1.ttf` | CoreBox字体 | 工具箱专用字体 |
| `img/logo/` | CoreBox Logo | 工具箱项目Logo文件 |
| `js/jQuery.js` | jQuery库 | CoreBox使用的jQuery |

## 📝 博客系统 (blog/)
| 目录/文件 | 用途 | 说明 |
|-----------|------|------|
| `jared/` | Jared的博客 | 个人博客目录 |
| `├── main.html` | 博客主页 | 博客首页 |
| `├── style.css` | 博客样式 | 博客专用样式 |
| `└── banniang/` | 看板娘系统 | Live2D看板娘组件 |

### 🎭 看板娘系统详细结构
| 目录 | 用途 | 说明 |
|------|------|------|
| `banniang/css/pio.css` | 看板娘样式 | Live2D组件样式 |
| `banniang/js/l2d.js` | Live2D核心 | Live2D引擎脚本 |
| `banniang/js/pio.js` | 看板娘逻辑 | 交互逻辑和控制 |
| `live2d-widget-models/` | 模型资源库 | 各种Live2D角色模型 |

#### 可用的Live2D角色模型
- `live2d-widget-model-blanc_normal/` - Blanc角色
- `live2d-widget-model-chitose/` - Chitose角色  
- `live2d-widget-model-haru/` - Haru角色 (01, 02版本)
- `live2d-widget-model-haruto/` - Haruto角色
- `live2d-widget-model-histoire/` - Histoire角色
- `live2d-widget-model-izumi/` - Izumi角色
- `live2d-widget-model-koharu/` - Koharu角色
- `live2d-widget-model-miku/` - 初音未来角色
- `live2d-widget-model-nepgear_extra/` - Nepgear角色
- `live2d-widget-model-shizuku/` - Shizuku角色
- `live2d-widget-model-vert/` - Vert角色
- `live2d-widget-model-wanko/` - Wanko角色
- `live2d-widget-model-z16/` - Z16角色

## 🔍 文件使用场景分析

### 🌐 用户访问流程
1. **首次访问**: `index.html` + `style.css` + `index.js`
2. **导航使用**: `template/navbar.*` + `nav.js`
3. **功能页面**: 各功能页面HTML + 对应CSS + JS
4. **API调用**: `api/` 目录下的PHP文件
5. **安全防护**: `.htaccess` + 安全头部

### 🛡️ 安全防护层级
1. **服务器层**: `.htaccess` 配置
2. **应用层**: PHP API 安全验证
3. **前端层**: CSP 安全策略 
4. **监控层**: 安全监控面板和API

### 📱 响应式设计
- **桌面版**: 完整功能和样式
- **移动版**: 响应式CSS + 移动端优化图片
- **交互优化**: JavaScript 适配不同设备

## 🎯 核心功能模块

### 🔒 安全防护模块
- 安全评估和监控工具
- API访问控制和频率限制
- 文件保护和备份机制

### 🎨 用户界面模块  
- 响应式导航和页脚
- 现代化CSS样式系统
- 交互动画和效果

### 🔧 功能服务模块
- QQ头像获取服务
- CoreBox工具箱
- 下载管理系统

### 📊 内容管理模块
- 博客系统和Live2D看板娘
- 更新日志管理
- SEO优化和搜索引擎支持

---

**文档版本**: v1.0  
**维护状态**: 🟢 活跃维护  
**最后更新**: 2025年5月29日  

💡 **提示**: 此文档涵盖了EXQ Studio项目的所有文件结构，可作为开发和维护的参考指南。
