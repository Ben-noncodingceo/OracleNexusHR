# 🔮 八字命理分析系统

一个完全基于 AI 的生辰八字、星座和月相分析工具，使用人工智能进行命理运算和专业分析。

## ✨ 功能特点

- 🎴 **AI 八字计算**：由 AI 精确计算年柱、月柱、日柱、时柱（天干地支）
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

### 安装步骤

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
├── index.html              # 前端主页面（含 AI 配置界面）
├── app.js                  # 前端应用逻辑
├── bazi-calculator.js      # 八字计算核心库（已弃用，由 AI 替代）
├── server.js               # 后端 Express 服务器（AI 代理）
├── package.json            # 项目配置和依赖
├── .env.example            # 环境变量模板（可选）
├── .gitignore             # Git 忽略文件
└── README.md              # 项目文档
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

### 问题：API 请求失败

**可能原因**：
1. API Key 不正确或已过期
2. API 配额用完
3. 网络连接问题
4. API URL 配置错误（自定义 API）

**解决方案**：
1. 检查 API Key 是否正确
2. 登录 API 提供商平台查看配额和状态
3. 检查网络连接和防火墙设置
4. 查看浏览器控制台和服务器日志

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
