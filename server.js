/**
 * 八字命理分析系统 - 后端服务器
 * 完全由 AI 进行命理运算和分析
 * 基于 DeepSeek 官方文档重构
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
 * 获取 API 配置
 */
function getAPIConfig(apiProvider, customApiUrl, customModel) {
    let apiUrl, model;

    if (apiProvider === 'deepseek') {
        // DeepSeek 官方文档: base_url 为 https://api.deepseek.com
        // 完整端点为 https://api.deepseek.com/v1/chat/completions
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

    return { apiUrl, model };
}

/**
 * 调用 OpenAI 兼容的 API
 */
async function callChatAPI(apiUrl, apiKey, model, messages, maxTokens = 2000) {
    const fetch = (await import('node-fetch')).default;

    console.log(`[API调用] URL: ${apiUrl}`);
    console.log(`[API调用] 模型: ${model}`);
    console.log(`[API调用] API Key 前缀: ${apiKey.substring(0, 20)}...`);

    const requestBody = {
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
    };

    console.log('[API调用] 请求体:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    console.log(`[API调用] HTTP 状态: ${response.status}`);

    const responseText = await response.text();
    console.log(`[API调用] 响应长度: ${responseText.length} 字符`);

    if (!response.ok) {
        console.error('[API调用] ❌ 请求失败');
        console.error('[API调用] 响应内容:', responseText);

        let errorMessage = `API 请求失败 (HTTP ${response.status})`;

        try {
            const errorJson = JSON.parse(responseText);
            console.error('[API调用] 错误详情:', JSON.stringify(errorJson, null, 2));

            // 提取错误信息
            if (errorJson.error) {
                if (typeof errorJson.error === 'string') {
                    errorMessage = errorJson.error;
                } else if (errorJson.error.message) {
                    errorMessage = errorJson.error.message;
                } else if (errorJson.error.type && errorJson.error.code) {
                    errorMessage = `${errorJson.error.type}: ${errorJson.error.code}`;
                }
            } else if (errorJson.message) {
                errorMessage = errorJson.message;
            }
        } catch (parseError) {
            console.error('[API调用] 无法解析错误响应为 JSON');
        }

        throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log('[API调用] ✅ 请求成功');

    return data;
}

/**
 * 测试 AI API 连接
 */
async function testAIConnection(apiConfig) {
    const { apiProvider, apiKey, customApiUrl, customModel } = apiConfig;

    console.log('\n========== API 连接测试 ==========');
    console.log(`提供商: ${apiProvider}`);

    if (!apiKey) {
        throw new Error('API Key 未提供');
    }

    try {
        const { apiUrl, model } = getAPIConfig(apiProvider, customApiUrl, customModel);

        const messages = [
            {
                role: 'user',
                content: '请回复"连接成功"'
            }
        ];

        const data = await callChatAPI(apiUrl, apiKey, model, messages, 50);

        console.log('[测试] ✅ API 连接成功');
        console.log('========== 测试成功 ==========\n');

        return {
            success: true,
            model: model,
            response: data
        };

    } catch (error) {
        console.error('\n========== API 测试失败 ==========');
        console.error('错误:', error.message);
        console.error('=====================================\n');
        throw error;
    }
}

/**
 * 调用 AI API 进行完整的命理分析
 */
async function analyzeWithAI(name, birthdate, birthtime, apiConfig) {
    const { apiProvider, apiKey, customApiUrl, customModel } = apiConfig;

    console.log('\n========== 命理分析开始 ==========');
    console.log(`姓名: ${name}`);
    console.log(`出生: ${birthdate} ${birthtime}`);
    console.log(`提供商: ${apiProvider}`);

    if (!apiKey) {
        throw new Error('API Key 未提供');
    }

    try {
        const { apiUrl, model } = getAPIConfig(apiProvider, customApiUrl, customModel);

        // 构建提示词
        const systemPrompt = '你是一位资深的命理学大师，精通生辰八字、五行八卦、易经周易、星座学和月相学等传统命理学知识。你的分析专业、准确、富有洞察力。你总是以纯JSON格式返回结果，不包含任何markdown标记或其他额外文字。';

        const userPrompt = `你是一位精通中国传统命理学的大师，精通生辰八字、五行八卦、星座学和月相学。

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

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const data = await callChatAPI(apiUrl, apiKey, model, messages, 2000);

        // 验证响应格式
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('[分析] 响应格式错误:', JSON.stringify(data).substring(0, 500));
            throw new Error('AI 响应格式不正确');
        }

        const aiResponse = data.choices[0].message.content;
        console.log('[分析] AI 返回内容长度:', aiResponse.length);
        console.log('[分析] AI 返回预览:', aiResponse.substring(0, 300));

        // 解析 JSON
        let analysisResult;
        try {
            let cleanedResponse = aiResponse.trim();

            // 移除可能的 markdown 标记
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
            }

            // 尝试提取 JSON 对象
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanedResponse = jsonMatch[0];
            }

            analysisResult = JSON.parse(cleanedResponse);
            console.log('[分析] ✅ JSON 解析成功');

        } catch (parseError) {
            console.error('\n========== JSON 解析失败 ==========');
            console.error('解析错误:', parseError.message);
            console.error('AI 原始返回（前 1000 字符）:');
            console.error(aiResponse.substring(0, 1000));
            console.error('=====================================\n');
            throw new Error('AI 返回的数据格式不正确，请重试');
        }

        // 验证数据结构
        if (!analysisResult.bazi || !analysisResult.advice) {
            console.error('[分析] 数据结构不完整');
            throw new Error('AI 返回的数据不完整，请重试');
        }

        console.log('[分析] ✅ 命理分析完成');
        console.log('========== 分析成功 ==========\n');

        return analysisResult;

    } catch (error) {
        console.error('\n========== 分析失败 ==========');
        console.error('错误:', error.message);
        if (error.stack) {
            console.error('堆栈:', error.stack.split('\n').slice(0, 3).join('\n'));
        }
        console.error('=====================================\n');
        throw error;
    }
}

/**
 * API 测试端点
 */
app.post('/api/test', async (req, res) => {
    try {
        const { apiProvider, apiKey, customApiUrl, customModel } = req.body;

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

        const testResult = await testAIConnection({
            apiProvider,
            apiKey,
            customApiUrl,
            customModel
        });

        res.json({
            success: true,
            model: testResult.model,
            message: 'API 连接测试成功'
        });

    } catch (error) {
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

        const analysisResult = await analyzeWithAI(name, birthdate, birthtime, {
            apiProvider,
            apiKey,
            customApiUrl,
            customModel
        });

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
    console.log('\n========================================');
    console.log('🔮 八字命理分析系统已启动');
    console.log(`🌐 服务器地址: http://localhost:${PORT}`);
    console.log(`📡 分析端点: http://localhost:${PORT}/api/analyze`);
    console.log(`🧪 测试端点: http://localhost:${PORT}/api/test`);
    console.log('');
    console.log('✨ 基于 DeepSeek 官方文档重构');
    console.log('📝 请在前端界面配置您的 API Key');
    console.log('');
    console.log('🔍 API 配置：');
    console.log('   - DeepSeek: https://api.deepseek.com/v1/chat/completions');
    console.log('   - OpenAI: https://api.openai.com/v1/chat/completions');
    console.log('   - 模型: deepseek-chat / gpt-4o-mini');
    console.log('========================================\n');
});

module.exports = app;
