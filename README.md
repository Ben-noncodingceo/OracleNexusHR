# 🔮 八字命理分析系统

一个基于 AI 的生辰八字、星座和月相分析工具，结合传统命理学和现代人工智能技术，为用户提供专业的命理分析和建议。

## ✨ 功能特点

- 🎴 **生辰八字计算**：自动计算年柱、月柱、日柱、时柱（天干地支）
- ⭐ **星座分析**：根据出生日期计算星座并提供运势建议
- 🌙 **月相分析**：计算出生时的月相并提供能量指引
- 🤖 **AI 智能分析**：使用 DeepSeek 或 ChatGPT API 生成专业命理建议
- 💎 **五行分析**：分析八字中的五行分布
- 🎨 **美观界面**：现代化、响应式的 Web 界面

## 🚀 快速开始

### 前置要求

- Node.js 14.0 或更高版本
- npm 或 yarn 包管理器
- DeepSeek API Key 或 OpenAI API Key

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

3. **配置环境变量**

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：

```env
PORT=3000
DEEPSEEK_API_KEY=your_deepseek_api_key_here
# 或者使用 OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

### 获取 API Key

#### DeepSeek API（推荐）

1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册账号并登录
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件

**优势**：
- 价格更实惠
- 支持中文更好
- 专门针对中文场景优化

#### OpenAI API（备选）

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册账号并登录
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件

### 启动应用

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

**开发模式**（自动重启）：

```bash
npm run dev
```

## 📖 使用说明

1. 打开浏览器访问 `http://localhost:3000`
2. 输入以下信息：
   - 姓名
   - 出生日期（公历）
   - 出生时间（24小时制）
3. 点击"开始分析命理"按钮
4. 等待系统计算和 AI 分析
5. 查看详细的八字、星座、月相分析结果

## 🏗️ 项目结构

```
bazi-fortune-calculator/
├── index.html              # 前端主页面
├── app.js                  # 前端应用逻辑
├── bazi-calculator.js      # 八字计算核心库
├── server.js               # 后端 Express 服务器
├── package.json            # 项目配置和依赖
├── .env.example            # 环境变量模板
├── .gitignore             # Git 忽略文件
└── README.md              # 项目文档
```

## 🔧 技术栈

### 前端
- HTML5
- CSS3（渐变、Grid 布局）
- Vanilla JavaScript（ES6+）

### 后端
- Node.js
- Express.js
- node-fetch（HTTP 请求）
- dotenv（环境变量管理）

### AI API
- DeepSeek API
- OpenAI API（ChatGPT）

## 📊 API 端点

### POST `/api/analyze`

分析生辰八字

**请求体**：
```json
{
  "name": "张三",
  "birthdate": "1990-01-01",
  "birthtime": "08:30",
  "apiType": "deepseek"
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
    "bazi": {
      "yearPillar": "己巳",
      "monthPillar": "丙子",
      "dayPillar": "甲寅",
      "hourPillar": "戊辰",
      "zodiac": "摩羯座",
      "moonPhase": "上弦月 🌓",
      "wuXing": { "木": 2, "火": 2, "土": 3, "金": 0, "水": 1 }
    },
    "advice": "AI生成的命理建议...",
    "zodiacAdvice": "星座运势建议...",
    "moonAdvice": "月相能量指引..."
  }
}
```

### GET `/api/health`

健康检查端点

## 🎯 核心算法

### 八字计算

本系统使用传统的天干地支计算方法：

1. **年柱**：根据公历年份计算，以 1984 年（甲子年）为基准
2. **月柱**：根据年干推算月干，月支固定
3. **日柱**：使用万年历算法，以 1900 年 1 月 1 日为基准
4. **时柱**：根据日干推算时干，时支根据时辰确定

### 星座计算

根据公历出生日期判断 12 星座。

### 月相计算

使用天文算法计算出生时的月相，包括：
- 新月 🌑
- 娥眉月 🌒
- 上弦月 🌓
- 盈凸月 🌔
- 满月 🌕
- 亏凸月 🌖
- 下弦月 🌗
- 残月 🌘

## ⚙️ 配置选项

### 切换 AI 服务

在 `app.js` 中修改 `apiType` 参数：

```javascript
const formData = {
    name: document.getElementById('name').value,
    birthdate: document.getElementById('birthdate').value,
    birthtime: document.getElementById('birthtime').value,
    apiType: 'deepseek'  // 改为 'openai' 使用 ChatGPT
};
```

### 修改端口

在 `.env` 文件中修改：

```env
PORT=8080
```

## 🔒 安全注意事项

1. **保护 API Key**：
   - 不要将 `.env` 文件提交到版本控制系统
   - 不要在客户端代码中暴露 API Key
   - 定期更换 API Key

2. **环境隔离**：
   - 开发和生产环境使用不同的 API Key
   - 设置 API 使用限制和监控

3. **错误处理**：
   - 所有 API 调用都有完善的错误处理
   - 敏感错误信息不会暴露给客户端

## 🐛 故障排除

### 问题：API 请求失败

**解决方案**：
1. 检查 `.env` 文件中的 API Key 是否正确
2. 确认 API Key 有足够的配额
3. 检查网络连接
4. 查看服务器日志获取详细错误信息

### 问题：八字计算不准确

**说明**：本系统使用公历进行计算，可能与传统农历八字略有差异。传统命理学需要考虑：
- 农历和公历的转换
- 节气时间（立春为年界）
- 地理位置的时差

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

- [ ] 添加农历转换功能
- [ ] 支持真太阳时校正
- [ ] 增加更详细的五行分析
- [ ] 添加大运流年计算
- [ ] 支持多语言界面
- [ ] 添加用户系统和历史记录
- [ ] 移动端 App 开发

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
