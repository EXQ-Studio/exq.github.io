# EXQ Studio 本地开发服务器启动脚本

Write-Host "🚀 启动 EXQ Studio 本地开发服务器..." -ForegroundColor Green

# 检查Python是否可用
$pythonCommands = @("python", "python3", "py")
$pythonFound = $false
$pythonCmd = ""

foreach ($cmd in $pythonCommands) {
    try {
        $version = & $cmd --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $pythonFound = $true
            $pythonCmd = $cmd
            Write-Host "✅ 找到Python: $version" -ForegroundColor Green
            break
        }
    }
    catch {
        continue
    }
}

if (-not $pythonFound) {
    # 尝试使用Node.js http-server
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 找到Node.js: $nodeVersion" -ForegroundColor Green
            Write-Host "📦 检查http-server..." -ForegroundColor Yellow
            
            # 检查http-server是否已安装
            $httpServerCheck = npx http-server --help 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "🌐 使用http-server启动服务器..." -ForegroundColor Cyan
                Write-Host "📍 本地地址: http://localhost:8080" -ForegroundColor Yellow
                Write-Host "🔗 网络地址: http://127.0.0.1:8080" -ForegroundColor Yellow
                Write-Host "💡 提示: 按 Ctrl+C 停止服务器" -ForegroundColor Gray
                Write-Host ""
                npx http-server -p 8080 -o
            } else {
                Write-Host "📦 安装http-server..." -ForegroundColor Yellow
                npm install -g http-server
                Write-Host "🌐 启动服务器..." -ForegroundColor Cyan
                npx http-server -p 8080 -o
            }
        } else {
            throw "Node.js not found"
        }
    }
    catch {
        Write-Host "❌ 未找到Python或Node.js，请安装其中之一:" -ForegroundColor Red
        Write-Host "   • Python: https://www.python.org/downloads/" -ForegroundColor Gray
        Write-Host "   • Node.js: https://nodejs.org/" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🔧 或者直接在浏览器中打开 file:// 协议的文件" -ForegroundColor Yellow
        Read-Host "按Enter键退出"
        exit 1
    }
} else {
    # 使用Python启动服务器
    Write-Host "🌐 使用Python启动HTTP服务器..." -ForegroundColor Cyan
    Write-Host "📍 本地地址: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "🔗 网络地址: http://127.0.0.1:8000" -ForegroundColor Yellow
    Write-Host "💡 提示: 按 Ctrl+C 停止服务器" -ForegroundColor Gray
    Write-Host ""
    
    # Python 3使用http.server模块
    if ($pythonCmd -eq "python3" -or $pythonCmd -eq "py") {
        & $pythonCmd -m http.server 8000
    } else {
        # 检查Python版本
        $versionOutput = & $pythonCmd --version 2>&1
        if ($versionOutput -match "Python 3") {
            & $pythonCmd -m http.server 8000
        } else {
            # Python 2使用SimpleHTTPServer
            & $pythonCmd -m SimpleHTTPServer 8000
        }
    }
}
