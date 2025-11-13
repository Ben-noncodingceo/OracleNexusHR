#!/usr/bin/env node

/**
 * 八字命理分析系统 - 自动启动脚本
 * 启动服务器并自动打开浏览器
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}`;

console.log('========================================');
console.log('🔮 八字命理分析系统自动启动器');
console.log('========================================');
console.log('');

/**
 * 检查服务器是否已经在运行
 */
function checkServerRunning() {
    return new Promise((resolve) => {
        const req = http.get(URL, (res) => {
            resolve(true);
        });
        req.on('error', () => {
            resolve(false);
        });
        req.setTimeout(1000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

/**
 * 打开浏览器
 */
function openBrowser(url) {
    const platform = process.platform;
    let command;

    if (platform === 'darwin') {
        command = `open "${url}"`;
    } else if (platform === 'win32') {
        command = `start "" "${url}"`;
    } else {
        // Linux
        command = `xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}" || gnome-open "${url}"`;
    }

    exec(command, (error) => {
        if (error) {
            console.log('\n⚠️  无法自动打开浏览器，请手动访问:', url);
        } else {
            console.log('\n✅ 浏览器已打开:', url);
        }
    });
}

/**
 * 等待服务器启动
 */
async function waitForServer(maxAttempts = 30) {
    console.log('⏳ 等待服务器启动...');

    for (let i = 0; i < maxAttempts; i++) {
        const isRunning = await checkServerRunning();
        if (isRunning) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.stdout.write('.');
    }

    console.log('');
    return false;
}

/**
 * 主函数
 */
async function main() {
    // 检查服务器是否已经运行
    const isAlreadyRunning = await checkServerRunning();

    if (isAlreadyRunning) {
        console.log('✅ 服务器已经在运行');
        console.log('🌐 地址:', URL);
        console.log('');
        openBrowser(URL);
        return;
    }

    console.log('🚀 正在启动服务器...');
    console.log('');

    // 启动服务器
    const serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit',
        cwd: __dirname
    });

    serverProcess.on('error', (error) => {
        console.error('❌ 启动失败:', error.message);
        console.log('');
        console.log('请检查:');
        console.log('1. 是否已安装 Node.js');
        console.log('2. 是否已运行 npm install');
        console.log('3. server.js 文件是否存在');
        process.exit(1);
    });

    // 等待服务器启动
    const serverStarted = await waitForServer();

    if (serverStarted) {
        console.log('');
        console.log('========================================');
        console.log('✅ 服务器启动成功！');
        console.log('🌐 访问地址:', URL);
        console.log('========================================');
        console.log('');
        console.log('💡 提示:');
        console.log('   - 按 Ctrl+C 可以停止服务器');
        console.log('   - 请保持此窗口打开');
        console.log('');

        // 等待2秒后打开浏览器
        setTimeout(() => {
            openBrowser(URL);
        }, 2000);

    } else {
        console.log('');
        console.log('❌ 服务器启动超时');
        console.log('请检查终端输出的错误信息');
        serverProcess.kill();
        process.exit(1);
    }

    // 处理退出信号
    process.on('SIGINT', () => {
        console.log('\n\n🛑 正在关闭服务器...');
        serverProcess.kill();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        serverProcess.kill();
        process.exit(0);
    });
}

// 运行主函数
main().catch((error) => {
    console.error('❌ 发生错误:', error);
    process.exit(1);
});
