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
 * 测试 AI API 连接
 */
async function testAIConnection(apiConfig) {
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

    console.log(`[测试] 测试 ${apiProvider} API 连接...`);
    console.log(`[测试] API URL: ${apiUrl}`);
    console.log(`[测试] 模型: ${model}`);

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
                        role: 'user',
                        content: '请回复"测试成功"'
                    }
                ],
                max_tokens: 50
            })
        });

        console.log(`[测试] 响应状态: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[测试] API 错误响应:', errorText);

            // 尝试解析错误信息
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error?.message || errorJson.message || `API 返回错误 (${response.status})`);
            } catch (e) {
                throw new Error(`API 请求失败 (${response.status}): ${errorText.substring(0, 100)}`);
            }
        }

        const data = await response.json();
        console.log('[测试] API 测试成功');

        return {
            success: true,
            model: model,
            response: data
        };

    } catch (error) {
        console.error('[测试] API 测试失败:', error.message);
        throw error;
    }
}

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

    console.log(`[分析] 开始分析: ${name}, ${birthdate} ${birthtime}`);
    console.log(`[分析] 使用 ${apiProvider} API, 模型: ${model}`);

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

        console.log('[分析] 发送请求到 AI API...');

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

        console.log(`[分析] AI API 响应状态: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[分析] API 错误响应:', errorText);

            // 尝试解析错误信息
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error?.message || errorJson.message || `API 返回错误 (${response.status})`);
            } catch (e) {
                throw new Error(`API 请求失败 (${response.status}): ${errorText.substring(0, 200)}`);
            }
        }

        const data = await response.json();
        console.log('[分析] 收到 AI 响应');

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('[分析] AI 响应格式错误:', JSON.stringify(data));
            throw new Error('AI 响应格式不正确');
        }

        const aiResponse = data.choices[0].message.content;
        console.log('[分析] AI 返回内容长度:', aiResponse.length);

        // 尝试解析 AI 返回的 JSON
        let analysisResult;
        try {
            // 清理可能的 markdown 代码块标记
            let cleanedResponse = aiResponse.trim();

            // 移除 markdown 代码块
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
            }

            console.log('[分析] 清理后的响应前100字符:', cleanedResponse.substring(0, 100));

            analysisResult = JSON.parse(cleanedResponse);
            console.log('[分析] JSON 解析成功');

        } catch (parseError) {
            console.error('[分析] JSON 解析错误:', parseError.message);
            console.error('[分析] AI 原始返回（前500字符）:', aiResponse.substring(0, 500));
            throw new Error('AI 返回的数据格式不正确，请重试');
        }

        // 验证返回的数据结构
        if (!analysisResult.bazi || !analysisResult.advice) {
            console.error('[分析] 数据结构不完整:', JSON.stringify(analysisResult));
            throw new Error('AI 返回的数据不完整');
        }

        console.log('[分析] 分析完成');
        return analysisResult;

    } catch (error) {
        console.error('[分析] 分析过程出错:', error.message);
        throw error;
    }
}

/**
 * API 测试端点
 */
app.post('/api/test', async (req, res) => {
    try {
        const { apiProvider, apiKey, customApiUrl, customModel } = req.body;

        console.log('\n========== API 测试请求 ==========');
        console.log('提供商:', apiProvider);

        // 验证必需参数
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

        // 测试 API 连接
        const testResult = await testAIConnection({
            apiProvider,
            apiKey,
            customApiUrl,
            customModel
        });

        console.log('========== API 测试成功 ==========\n');

        res.json({
            success: true,
            model: testResult.model,
            message: 'API 连接测试成功'
        });

    } catch (error) {
        console.error('========== API 测试失败 ==========');
        console.error('错误:', error.message);
        console.error('======================================\n');

        res.status(500).json({
            success: false,
            error: error.message || 'API 测试失败'
        });
    }
});

/**
 * 主要 API 端点：分析八字
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { name, birthdate, birthtime, apiProvider, apiKey, customApiUrl, customModel } = req.body;

        console.log('\n========== 命理分析请求 ==========');
        console.log('姓名:', name);
        console.log('出生日期:', birthdate);
        console.log('出生时间:', birthtime);
        console.log('API 提供商:', apiProvider);

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

        console.log('========== 分析完成 ==========\n');

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
        console.error('========== 分析失败 ==========');
        console.error('错误类型:', error.constructor.name);
        console.error('错误信息:', error.message);
        console.error('错误堆栈:', error.stack);
        console.error('==================================\n');

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
    console.log('========================================');
    console.log('🔮 八字命理分析系统已启动');
    console.log(`🌐 服务器地址: http://localhost:${PORT}`);
    console.log(`📡 API 端点: http://localhost:${PORT}/api/analyze`);
    console.log(`🧪 测试端点: http://localhost:${PORT}/api/test`);
    console.log('');
    console.log('✨ 本系统使用 AI 进行命理运算和分析');
    console.log('📝 请在前端界面配置您的 API Key');
    console.log('========================================\n');
});

module.exports = app;
