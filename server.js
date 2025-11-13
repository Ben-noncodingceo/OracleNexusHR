/**
 * 八字命理分析系统 - 后端服务器
 * 支持 DeepSeek API 和 ChatGPT API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const BaziCalculator = require('./bazi-calculator.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 实例化八字计算器
const baziCalc = new BaziCalculator();

/**
 * 调用 AI API 获取命理建议
 */
async function getAIAdvice(baziInfo, apiType = 'deepseek') {
    const apiKey = apiType === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
    const apiUrl = apiType === 'deepseek'
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    const model = apiType === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

    if (!apiKey) {
        throw new Error(`${apiType.toUpperCase()} API key not configured`);
    }

    // 构建五行信息
    const wuxingInfo = Object.entries(baziInfo.wuXing)
        .map(([element, count]) => `${element}: ${count}`)
        .join(', ');

    const prompt = `你是一位专业的命理大师。请根据以下八字信息提供命理分析和建议：

【基本信息】
八字: ${baziInfo.fullBazi}
年柱: ${baziInfo.yearPillar}
月柱: ${baziInfo.monthPillar}
日柱: ${baziInfo.dayPillar}（日主）
时柱: ${baziInfo.hourPillar}

【五行分析】
${wuxingInfo}

【星座】
${baziInfo.zodiac}

【月相】
${baziInfo.moonPhase}

请提供一段约200字的命理建议，包括：
1. 五行属性分析
2. 性格特点
3. 适合的职业方向
4. 人生建议

请用专业但易懂的语言，温暖而具有启发性的方式表达。`;

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
                        content: '你是一位资深的命理学大师，精通生辰八字、五行八卦、易经周易等传统命理学知识。你的分析专业、准确、富有洞察力。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI API Error:', error);
        throw error;
    }
}

/**
 * 获取星座建议
 */
async function getZodiacAdvice(zodiac, apiType = 'deepseek') {
    const apiKey = apiType === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
    const apiUrl = apiType === 'deepseek'
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    const model = apiType === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

    if (!apiKey) {
        throw new Error(`${apiType.toUpperCase()} API key not configured`);
    }

    const prompt = `请为${zodiac}提供一段约150字的运势建议，包括性格特点、优势、需要注意的方面，以及近期运势指引。`;

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
                        content: '你是一位专业的星座分析师，精通西方占星学。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Zodiac API Error:', error);
        throw error;
    }
}

/**
 * 获取月相建议
 */
async function getMoonPhaseAdvice(moonPhase, apiType = 'deepseek') {
    const apiKey = apiType === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
    const apiUrl = apiType === 'deepseek'
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    const model = apiType === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

    if (!apiKey) {
        throw new Error(`${apiType.toUpperCase()} API key not configured`);
    }

    const prompt = `请为出生在${moonPhase}的人提供一段约150字的能量指引，说明这个月相对个人性格和命运的影响，以及如何利用月相能量。`;

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
                        content: '你是一位精通月相能量学的专家，了解月相对人的影响。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Moon Phase API Error:', error);
        throw error;
    }
}

/**
 * 主要 API 端点：分析八字
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { name, birthdate, birthtime, apiType = 'deepseek' } = req.body;

        if (!name || !birthdate || !birthtime) {
            return res.status(400).json({
                success: false,
                error: '请提供完整的姓名、出生日期和时间'
            });
        }

        // 解析日期时间
        const [year, month, day] = birthdate.split('-').map(Number);
        const [hour, minute] = birthtime.split(':').map(Number);
        const birthDate = new Date(year, month - 1, day, hour, minute);

        // 计算八字
        const bazi = baziCalc.calculate(birthDate);
        const baziInfo = baziCalc.format(bazi);

        // 并行调用 AI API 获取建议
        const [baziAdvice, zodiacAdvice, moonAdvice] = await Promise.all([
            getAIAdvice(baziInfo, apiType),
            getZodiacAdvice(baziInfo.zodiac, apiType),
            getMoonPhaseAdvice(baziInfo.moonPhase, apiType)
        ]);

        // 返回结果
        res.json({
            success: true,
            data: {
                name: name,
                birthdate: birthdate,
                birthtime: birthtime,
                bazi: baziInfo,
                advice: baziAdvice,
                zodiacAdvice: zodiacAdvice,
                moonAdvice: moonAdvice
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
    console.log('请确保已配置以下环境变量：');
    console.log('  - DEEPSEEK_API_KEY (DeepSeek API)');
    console.log('  - OPENAI_API_KEY (ChatGPT API)');
});

module.exports = app;
