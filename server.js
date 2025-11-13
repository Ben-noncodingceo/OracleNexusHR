/**
 * 八字命理分析系统 - 后端服务器
 * 完全由 AI 进行命理运算和分析
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

/**
 * 调用 AI API 进行完整的命理分析
 */
async function analyzeWithAI(name, birthdate, birthtime, apiConfig) {
    const { apiProvider, apiKey, customApiUrl, customModel } = apiConfig;

    // 确定 API URL 和模型
    let apiUrl, model;

    if (apiProvider === 'deepseek') {
        apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        model = 'deepseek-chat';
    } else if (apiProvider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        model = 'gpt-4o-mini';
    } else if (apiProvider === 'custom') {
        apiUrl = customApiUrl;
        model = customModel;
    } else {
        throw new Error('不支持的 API 提供商');
    }

    if (!apiKey) {
        throw new Error('API Key 未提供');
    }

    // 构建 AI 提示词
    const prompt = `你是一位精通中国传统命理学的大师，精通生辰八字、五行八卦、星座学和月相学。

【任务】
请根据以下信息进行完整的命理分析：
- 姓名：${name}
- 出生日期：${birthdate}（公历）
- 出生时间：${birthtime}（24小时制）

【要求】
请按照以下JSON格式返回分析结果，确保返回的是**纯JSON格式**，不要包含任何markdown标记（如\`\`\`json）或其他额外文字：

{
  "bazi": {
    "yearPillar": "年柱（如：甲子）",
    "monthPillar": "月柱（如：乙丑）",
    "dayPillar": "日柱（如：丙寅）",
    "hourPillar": "时柱（如：丁卯）",
    "zodiac": "星座（如：白羊座）",
    "moonPhase": "月相（如：满月 🌕）"
  },
  "advice": "200字左右的八字命理分析和建议，包括五行属性、性格特点、适合的职业方向、人生建议",
  "zodiacAdvice": "150字左右的星座运势建议",
  "moonAdvice": "150字左右的月相能量指引",
  "gender": "根据姓名推测的性别（男/女/未知）"
}

【注意事项】
1. 年柱：根据公历年份计算天干地支
2. 月柱：根据年份和月份计算，注意节气
3. 日柱：使用万年历算法精确计算
4. 时柱：根据出生时间确定时辰（子丑寅卯辰巳午未申酉戌亥）
5. 星座：根据公历日期判断12星座
6. 月相：计算出生当天的月相（新月🌑、娥眉月🌒、上弦月🌓、盈凸月🌔、满月🌕、亏凸月🌖、下弦月🌗、残月🌘）
7. 所有建议需专业、温暖、具有启发性
8. 必须返回纯JSON格式，不要添加任何解释文字

请立即返回JSON结果：`;

    try {
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: '你是一位资深的命理学大师，精通生辰八字、五行八卦、易经周易、星座学和月相学等传统命理学知识。你的分析专业、准确、富有洞察力。你总是以JSON格式返回结果，不包含任何markdown标记。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // 尝试解析 AI 返回的 JSON
        let analysisResult;
        try {
            // 清理可能的 markdown 代码块标记
            let cleanedResponse = aiResponse.trim();
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
            }

            analysisResult = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('AI Response:', aiResponse);
            throw new Error('AI 返回的数据格式不正确，请重试');
        }

        // 验证返回的数据结构
        if (!analysisResult.bazi || !analysisResult.advice) {
            throw new Error('AI 返回的数据不完整');
        }

        return analysisResult;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        throw error;
    }
}

/**
 * 主要 API 端点：分析八字
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { name, birthdate, birthtime, apiProvider, apiKey, customApiUrl, customModel } = req.body;

        // 验证必需参数
        if (!name || !birthdate || !birthtime) {
            return res.status(400).json({
                success: false,
                error: '请提供完整的姓名、出生日期和时间'
            });
        }

        if (!apiProvider || !apiKey) {
            return res.status(400).json({
                success: false,
                error: '请配置 AI API 信息'
            });
        }

        if (apiProvider === 'custom' && (!customApiUrl || !customModel)) {
            return res.status(400).json({
                success: false,
                error: '使用自定义 API 时，请提供 API URL 和模型名称'
            });
        }

        // 调用 AI 进行分析
        const analysisResult = await analyzeWithAI(name, birthdate, birthtime, {
            apiProvider,
            apiKey,
            customApiUrl,
            customModel
        });

        // 返回结果
        res.json({
            success: true,
            data: {
                name: name,
                birthdate: birthdate,
                birthtime: birthtime,
                gender: analysisResult.gender || '未知',
                bazi: analysisResult.bazi,
                advice: analysisResult.advice,
                zodiacAdvice: analysisResult.zodiacAdvice,
                moonAdvice: analysisResult.moonAdvice
            }
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || '分析过程中发生错误'
        });
    }
});

/**
 * 健康检查端点
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * 主页
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🔮 八字命理分析系统已启动`);
    console.log(`🌐 服务器地址: http://localhost:${PORT}`);
    console.log(`📡 API 端点: http://localhost:${PORT}/api/analyze`);
    console.log('');
    console.log('✨ 本系统使用 AI 进行命理运算和分析');
    console.log('📝 请在前端界面配置您的 API Key');
});

module.exports = app;
