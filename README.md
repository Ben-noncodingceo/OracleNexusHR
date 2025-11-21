# 🔮 八字命理分析系统

一个完全基于 AI 的生辰八字、星座和月相分析工具，使用人工智能进行命理运算和专业分析。

## 🌐 在线部署

### 快速部署到 Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/OracleNexusHR)

**5分钟免费部署**：
1. 点击上方按钮
2. 用 GitHub 登录 Vercel
3. 点击 "Deploy"
4. 获得免费域名（xxx.vercel.app）

详细部署指南请查看 [部署指南.md](./部署指南.md)

> **注意**：GitHub Pages 不支持 Node.js 后端，请使用 Vercel、Render 或 Railway 部署。

## ✨ 功能特点

- 🎴 **AI 八字计算**：由 AI 精确计算年柱、月柱、日柱、时柱（天干地支）
- 👤 **性别识别**：根据性别调整命理分析侧重点（男命/女命）
- 📍 **城市定位**：AI 自动识别城市省份和经纬度
- ⏰ **真太阳时**：基于地理位置精确计算真太阳时，时柱更准确
- ⭐ **星座分析**：AI 根据出生日期判断星座并提供运势建议
- 🌙 **月相分析**：AI 计算出生时的月相并提供能量指引
- 🤖 **完全 AI 驱动**：所有命理运算和分析均由 AI 完成，更专业准确
- 🔧 **灵活配置**：支持 DeepSeek、OpenAI 或自定义 API
- 🔑 **前端配置**：在界面直接输入 API Key，无需服务器配置
- 🎨 **美观界面**：现代化、响应式的 Web 界面

## 🚀 快速开始

### 前置要求

- Node.js 14.0 或更高版本
- npm 或 yarn 包管理器
- DeepSeek API Key 或 OpenAI API Key（使用时在界面配置）

### 方式一：一键启动（推荐）⭐

**Windows 用户**：
1. 双击运行 `start.bat`
2. 等待依赖自动安装和服务器启动
3. **浏览器会自动打开！** 🚀

**Linux/Mac 用户**：
```bash
./start.sh
```
或
```bash
bash start.sh
```

**特点**：
- ✅ 自动检查并安装依赖
- ✅ 自动启动服务器
- ✅ **自动打开浏览器**到正确页面
- ✅ 无需任何手动操作！

### 方式二：使用启动器页面

如果不想使用命令行，可以双击打开 `launcher.html` 文件：
- 📱 友好的图形界面
- 🔍 自动检测服务器状态
- 📋 一键复制启动命令
- 🔄 自动重试连接
- 💡 详细的启动指南

当服务器启动后，启动器会自动检测并提供"打开应用"按钮。

### 方式三：手动启动

1. **克隆或下载项目**

```bash
git clone <repository-url>
cd bazi-fortune-calculator
```

2. **安装依赖**

```bash
npm install
```

3. **启动应用**

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

**开发模式**（自动重启）：

```bash
npm run dev
```

### 重要提示

⚠️ **必须先启动服务器，然后才能使用网页！**

如果直接打开 `index.html` 文件，会显示"服务器未启动"错误。
正确的使用方式：
1. 运行 `npm start` 或 `start.bat` / `start.sh` 启动服务器
2. 在浏览器访问 `http://localhost:3000`
3. 页面顶部显示 🟢 服务器运行正常，即可正常使用

### 获取 API Key

#### DeepSeek API（推荐）

1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册账号并登录
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 在网页界面的"AI 配置"部分输入 API Key

**优势**：
- 价格更实惠（约 ¥1/百万tokens）
- 中文支持更好
- 专门针对中文场景优化
- 命理分析更准确

#### OpenAI API（备选）

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册账号并登录
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 在网页界面的"AI 配置"部分输入 API Key

#### 自定义 API

本系统支持任何兼容 OpenAI API 格式的服务：
- 选择"自定义 API"
- 输入 API URL（如：`https://api.example.com/v1/chat/completions`）
- 输入模型名称
- 输入 API Key

## 📖 使用说明

1. 打开浏览器访问 `http://localhost:3000`
2. 填写个人信息：
   - 姓名
   - 出生日期（公历）
   - 出生时间（24小时制）
3. 配置 AI 服务：
   - 选择 AI 提供商（DeepSeek/OpenAI/自定义）
   - 输入 API Key
   - 如选择自定义，还需输入 API URL 和模型名称
4. 点击"开始分析命理"按钮
5. 等待 AI 计算和分析（约 10-30 秒）
6. 查看详细的八字、星座、月相分析结果

## 🏗️ 项目结构

```
bazi-fortune-calculator/
├── index.html              # 前端主页面（含 AI 配置界面和服务器状态检查）
├── launcher.html           # 🆕 启动器页面（图形化启动引导）
├── app.js                  # 前端应用逻辑（含详细错误处理和服务器状态检查）
├── bazi-calculator.js      # 八字计算核心库（已弃用，由 AI 替代）
├── server.js               # 后端 Express 服务器（AI 代理、日志系统）
├── start.js                # 🆕 Node.js 启动脚本（自动启动服务器并打开浏览器）
├── start.sh                # Linux/Mac 一键启动脚本（已集成自动打开浏览器）
├── start.bat               # Windows 一键启动脚本（已集成自动打开浏览器）
├── package.json            # 项目配置和依赖
├── .env.example            # 环境变量模板（可选）
├── .gitignore              # Git 忽略文件
├── README.md               # 项目文档（含详细故障排除指南）
└── 快速使用指南.md         # 🆕 图文并茂的快速上手指南
```

## 🔧 技术栈

### 前端
- HTML5
- CSS3（渐变、Grid 布局、响应式设计）
- Vanilla JavaScript（ES6+）
- 前端 API 配置（无需后端环境变量）

### 后端
- Node.js
- Express.js（API 代理服务器）
- node-fetch（HTTP 请求）

### AI API
- DeepSeek API（推荐）
- OpenAI API（ChatGPT）
- 支持任何兼容 OpenAI 格式的 API

## 📊 API 端点

### POST `/api/analyze`

使用 AI 分析生辰八字

**请求体**：
```json
{
  "name": "张三",
  "birthdate": "1990-01-01",
  "birthtime": "08:30",
  "apiProvider": "deepseek",
  "apiKey": "sk-xxxxx",
  "customApiUrl": "https://api.example.com/v1/chat/completions",
  "customModel": "gpt-3.5-turbo"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "name": "张三",
    "birthdate": "1990-01-01",
    "birthtime": "08:30",
    "gender": "男",
    "bazi": {
      "yearPillar": "己巳",
      "monthPillar": "丙子",
      "dayPillar": "甲寅",
      "hourPillar": "戊辰",
      "zodiac": "摩羯座",
      "moonPhase": "上弦月 🌓"
    },
    "advice": "AI生成的命理建议（200字）...",
    "zodiacAdvice": "星座运势建议（150字）...",
    "moonAdvice": "月相能量指引（150字）..."
  }
}
```

### GET `/api/health`

健康检查端点

## 🎯 核心原理

### AI 驱动的命理分析

本系统完全由 AI 进行命理运算和分析，相比传统算法更加：

**优势**：
- ✅ **更准确**：AI 掌握完整的命理知识体系，包括节气、农历转换等复杂规则
- ✅ **更专业**：能够综合考虑多种命理因素，给出专业建议
- ✅ **更灵活**：可以适应不同的命理流派和解读方式
- ✅ **更易维护**：无需维护复杂的算法代码

### AI 计算内容

1. **八字计算**：
   - 年柱：根据公历年份计算天干地支（考虑节气）
   - 月柱：根据年份和月份计算（考虑节气交界）
   - 日柱：使用万年历算法精确计算
   - 时柱：根据出生时间确定时辰地支

2. **星座判断**：
   根据公历出生日期判断 12 星座

3. **月相计算**：
   计算出生当天的月相（新月🌑、上弦月🌓、满月🌕、下弦月🌗等）

4. **命理分析**：
   综合五行、星座、月相等多维度信息，生成个性化建议

## ⚙️ 配置选项

### 切换 AI 服务

直接在网页界面选择：
- **DeepSeek**：推荐，价格实惠，中文支持好
- **OpenAI**：ChatGPT，英文场景更强
- **自定义 API**：任何兼容 OpenAI 格式的服务

### 修改端口

设置环境变量或直接修改代码：

```bash
PORT=8080 npm start
```

或在 `server.js` 中修改：
```javascript
const PORT = process.env.PORT || 3000;
```

## 🔒 安全注意事项

⚠️ **重要**：本系统在前端输入 API Key，存在一定安全风险

1. **API Key 保护**：
   - API Key 会通过 HTTPS 传输到后端
   - 不会存储在浏览器或服务器
   - 建议在个人设备上使用
   - 为 API Key 设置使用限额

2. **生产环境建议**：
   - 如需公开部署，建议在后端配置 API Key
   - 修改代码移除前端 API Key 输入功能
   - 使用环境变量管理敏感信息

3. **使用限制**：
   - 定期检查 API 使用情况
   - 设置月度消费上限
   - 及时撤销泄露的 API Key

## 🐛 故障排除

### 问题：页面显示"服务器未启动"或"Load failed"

**原因**：服务器没有运行

**解决方案**：
1. **检查服务器是否启动**：
   - 页面顶部应该显示 🟢 服务器运行正常
   - 如果显示 🔴 服务器未启动，说明后端服务器没有运行

2. **启动服务器**：
   ```bash
   # 方式一：使用启动脚本
   ./start.sh        # Linux/Mac
   start.bat         # Windows (双击运行)

   # 方式二：手动启动
   npm install       # 首次运行需要安装依赖
   npm start         # 启动服务器
   ```

3. **验证服务器启动成功**：
   - 终端/命令行应该显示：
     ```
     ========================================
     🔮 八字命理分析系统已启动
     🌐 服务器地址: http://localhost:3000
     ========================================
     ```
   - 刷新浏览器页面，服务器状态应该变为绿色

4. **访问正确的 URL**：
   - ✅ 正确：`http://localhost:3000`
   - ❌ 错误：直接打开 `index.html` 文件

### 问题：下载日志失败

**原因**：服务器未运行或网络连接问题

**解决方案**：
1. 确保服务器正在运行（参考上一条）
2. 检查浏览器控制台是否有错误信息
3. 手动访问 `http://localhost:3000/api/logs/download` 查看是否可以访问

### 问题：API 请求失败

**可能原因**：
1. API Key 不正确或已过期
2. API 配额用完
3. 网络连接问题
4. API URL 配置错误（自定义 API）

**解决方案**：
1. **使用 API 测试功能**：
   - 填写 API Key 后，点击"🔍 测试 API 连接"按钮
   - 查看具体的错误信息和错误代码

2. **检查 API Key**：
   - DeepSeek: 登录 https://platform.deepseek.com/ 查看 API Key
   - OpenAI: 登录 https://platform.openai.com/ 查看 API Key
   - 确保 API Key 以正确的前缀开头（sk-xxxx）

3. **检查网络连接**：
   - 确保可以访问 API 服务商的网站
   - 检查防火墙设置
   - 如在中国大陆，OpenAI API 可能需要代理

4. **查看详细错误**：
   - 系统现在会显示详细的错误代码和信息
   - 点击"📥 下载服务器日志"查看完整的错误日志
   - 错误代码说明：
     - `NETWORK_ERROR`: 网络连接失败
     - `HTTP_401`: API Key 无效
     - `HTTP_429`: API 配额不足或请求过于频繁
     - `HTTP_500`: API 服务器错误
     - `JSON_PARSE_ERROR`: AI 返回数据格式错误

### 问题：AI 返回的数据格式不正确

**说明**：AI 有时可能返回非标准格式的 JSON

**解决方案**：
1. 重新提交请求（AI 输出具有随机性）
2. 尝试更换 AI 服务提供商
3. 查看服务器日志中的 AI 原始返回内容

### 问题：八字计算与传统算法有差异

**说明**：AI 计算结果可能考虑了更多因素：
- 农历和公历的精确转换
- 节气时间（立春为年界）
- 地理位置的时差
- 不同命理流派的差异

这是正常现象，AI 的结果可能更加全面。

### 问题：npm install 失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules

# 重新安装
npm install
```

## 📝 开发计划

- [x] ✅ AI 完全接管命理运算
- [x] ✅ 前端 API 配置界面
- [x] ✅ 支持多种 AI 服务提供商
- [ ] 添加后端 API Key 加密存储（提高安全性）
- [ ] 添加用户系统和历史记录
- [ ] 支持批量分析
- [ ] 添加更多命理分析维度（大运、流年等）
- [ ] 移动端优化
- [ ] 多语言支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Your Name

## 🙏 致谢

- 感谢 DeepSeek 提供优秀的 AI API 服务
- 感谢所有开源项目的贡献者

---

**免责声明**：本系统仅供娱乐和参考，不应作为重大决策的唯一依据。命理学是一门传统文化，请理性对待。
