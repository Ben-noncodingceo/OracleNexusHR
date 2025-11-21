# GitHub Pages 部署指南

## 🎉 纯静态版本说明

本版本已升级为**纯静态版本**，可以直接部署到 GitHub Pages，无需任何后端服务器！

### ✨ 主要特性

- ✅ **纯前端实现**：所有 AI 调用直接从浏览器发起
- ✅ **无需后端**：不依赖 Node.js 服务器
- ✅ **免费部署**：完全支持 GitHub Pages
- ✅ **默认配置**：已内置 DeepSeek API Key，开箱即用
- ✅ **快速访问**：获得 `xxx.github.io` 域名

---

## 📦 部署步骤

### 步骤 1: 推送代码到 GitHub

代码已经准备就绪，只需推送到 GitHub：

```bash
# 确保在正确的分支上
git status

# 推送到远程仓库
git push -u origin claude/bazi-fortune-calculator-011CV5V93zFc1p6xeNHYd4va
```

### 步骤 2: 启用 GitHub Pages

1. **访问仓库设置**
   - 打开您的 GitHub 仓库：https://github.com/Ben-noncodingceo/OracleNexusHR
   - 点击 "Settings" 选项卡

2. **配置 Pages**
   - 在左侧菜单中找到 "Pages"
   - 在 "Source" 部分：
     - Branch: 选择 `main`（或您的主分支）
     - Folder: 选择 `/ (root)`
   - 点击 "Save" 保存

3. **等待部署**
   - GitHub 会自动构建和部署（2-3 分钟）
   - 部署完成后，页面顶部会显示您的网站地址

4. **获取域名**
   - 格式：`https://ben-noncodingceo.github.io/OracleNexusHR/`
   - 点击链接即可访问您的八字命理系统！

---

## 🌐 访问您的应用

部署成功后，您的八字命理分析系统将可通过以下地址访问：

```
https://ben-noncodingceo.github.io/OracleNexusHR/
```

### 特点：
- ✅ **全球访问**：任何人都可以通过链接访问
- ✅ **免费 HTTPS**：GitHub 自动提供 SSL 证书
- ✅ **无需配置**：已预配置 API Key，直接使用
- ✅ **移动友好**：响应式设计，支持手机访问

---

## 🔧 技术说明

### 架构变化

#### 之前的版本（Vercel）：
```
浏览器 → Node.js 后端 → AI API
```

#### 现在的版本（GitHub Pages）：
```
浏览器 → 直接调用 → AI API
```

### 关键改动：

1. **前端直接调用 AI API**
   - `app.js` 中新增 `analyzeWithAIDirect()` 函数
   - 直接使用 `fetch()` 调用 DeepSeek/OpenAI API
   - 不再依赖 `/api/analyze` 后端端点

2. **城市识别功能**
   - `identifyCityLocation()` 函数直接在浏览器中运行
   - 使用 AI 识别城市的省份和经纬度

3. **API 测试功能**
   - 更新为直接调用 API
   - 无需后端服务器

4. **服务器状态检查**
   - 在 GitHub Pages 版本中自动隐藏
   - 不再显示"服务器未启动"警告

---

## ⚠️ 重要安全提示

### API Key 已公开

由于纯静态网站的限制，API Key 必须内置在前端代码中：

```javascript
// index.html 中
<input type="password" id="apiKey" value="sk-ab5d12636e6742ae8a0b5d539f1378c6">
```

### 风险：
1. ❌ 任何查看网页源代码的人都能看到 API Key
2. ❌ 可能导致 API 配额被滥用
3. ❌ 可能产生意外费用

### 建议措施：

#### 方案一：监控使用情况（推荐）
1. 访问 DeepSeek Dashboard：https://platform.deepseek.com/usage
2. 定期检查 API 使用量
3. 设置使用限额提醒
4. 发现异常立即更换 API Key

#### 方案二：定期轮换 API Key
1. 每周或每月更换一次 API Key
2. 在 DeepSeek 平台创建新 Key
3. 更新 `index.html` 中的 Key
4. 推送到 GitHub（自动重新部署）
5. 撤销旧的 Key

#### 方案三：使用 Vercel + 环境变量（最安全）
如果安全性是首要考虑，建议：
1. 保留后端版本，部署到 Vercel
2. API Key 存储在 Vercel 环境变量中
3. 前端通过后端代理调用 AI API
4. GitHub Pages 版本仅用于展示/测试

---

## 🆚 GitHub Pages vs Vercel

| 特性 | GitHub Pages | Vercel |
|------|-------------|---------|
| **部署方式** | 纯静态网站 | 支持 Node.js 后端 |
| **域名** | xxx.github.io | xxx.vercel.app |
| **费用** | 完全免费 | 免费（有限额） |
| **API Key 安全** | ❌ 必须公开在前端 | ✅ 可存储在环境变量 |
| **部署速度** | 2-3 分钟 | 1-2 分钟 |
| **自定义域名** | ✅ 支持 | ✅ 支持 |
| **HTTPS** | ✅ 自动 | ✅ 自动 |
| **适用场景** | 演示、个人使用 | 生产环境、多用户 |

### 建议：
- **个人使用/演示**：使用 GitHub Pages（本版本）
- **生产环境/公开服务**：使用 Vercel + 环境变量

---

## 📱 使用您的应用

部署成功后，访问您的 GitHub Pages 链接：

1. **打开网站**：`https://ben-noncodingceo.github.io/OracleNexusHR/`

2. **直接使用**（无需配置）：
   - ✅ AI 已预配置
   - ✅ 无需输入 API Key
   - ✅ 填写信息即可分析

3. **填写信息**：
   - 姓名
   - 性别（男/女）
   - 出生日期
   - 出生时间
   - 出生城市

4. **查看结果**：
   - 生辰八字（基于真太阳时）
   - 命理分析（200字）
   - 星座运势（150字）
   - 月相指引（150字）

---

## 🔄 更新应用

当您需要更新代码时：

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "更新描述"

# 3. 推送到 GitHub
git push origin main

# 4. GitHub Pages 会自动重新部署（2-3分钟）
```

---

## ❓ 常见问题

### Q1: 部署后显示 404？
**A**: 检查以下项目：
1. GitHub Pages 是否已启用
2. 分支选择是否正确（应为 `main`）
3. 等待 2-3 分钟让部署完成
4. 清除浏览器缓存后重试

### Q2: API 调用失败？
**A**: 可能的原因：
1. **CORS 问题**：DeepSeek API 应该支持 CORS，如果不支持，可能需要使用代理
2. **API Key 失效**：检查 API Key 是否有效
3. **配额用尽**：检查 DeepSeek 账户余额
4. **网络问题**：检查浏览器控制台的错误信息

### Q3: 如何自定义域名？
**A**: 在 GitHub Pages 设置中：
1. 点击 "Custom domain"
2. 输入您的域名（如 `bazi.example.com`）
3. 在域名 DNS 设置中添加 CNAME 记录指向 `ben-noncodingceo.github.io`
4. 等待 DNS 生效（可能需要几小时）

### Q4: 如何保护 API Key？
**A**: 纯静态网站无法完全保护 API Key。建议：
1. 定期监控使用量
2. 设置使用限额
3. 定期更换 Key
4. 或使用 Vercel 版本（支持环境变量）

---

## 📚 相关文档

- `部署指南.md` - Vercel/Render/Railway 部署教程
- `部署完成指南.md` - 获取在线域名的详细说明
- `RELEASE_NOTES_v1.0.0.md` - v1.0.0 版本更新日志
- `快速使用指南.md` - 图文并茂的使用教程
- `README.md` - 项目总体说明

---

## ✅ 总结

GitHub Pages 版本的优势：
- ✅ **完全免费**：无任何费用
- ✅ **简单部署**：几分钟即可上线
- ✅ **github.io 域名**：专业的免费域名
- ✅ **全球访问**：GitHub CDN 保证速度
- ✅ **自动部署**：推送代码自动更新

**下一步**：
1. 推送代码到 GitHub
2. 在仓库设置中启用 GitHub Pages
3. 访问您的 `xxx.github.io` 域名
4. 开始使用八字命理分析系统！🎉
