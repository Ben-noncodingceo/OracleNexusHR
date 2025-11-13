/**
 * 八字命理分析系统 - 后端服务器
 * 完全由 AI 进行命理运算和分析
 * 基于 DeepSeek 官方文档重构
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 日志收集
const logs = [];
const MAX_LOGS = 1000;

function addLog(level, category, message, data = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data
    };

    logs.push(logEntry);

    // 限制日志数量
    if (logs.length > MAX_LOGS) {
        logs.shift();
    }

    // 同时输出到控制台
    const logMessage = `[${logEntry.timestamp}] [${level}] [${category}] ${message}`;
    if (level === 'ERROR') {
        console.error(logMessage, data || '');
    } else {
        console.log(logMessage, data || '');
    }
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 请求日志中间件
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        addLog('INFO', 'REQUEST', `${req.method} ${req.path}`, {
            body: req.body,
            headers: {
                'content-type': req.headers['content-type'],
                'user-agent': req.headers['user-agent']
            }
        });
    }
    next();
});

/**
 * 获取 API 配置
 */
function getAPIConfig(apiProvider, customApiUrl, customModel) {
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

    return { apiUrl, model };
}

/**
 * 调用 OpenAI 兼容的 API
 */
async function callChatAPI(apiUrl, apiKey, model, messages, maxTokens = 2000) {
    const fetch = (await import('node-fetch')).default;

    addLog('INFO', 'API_CALL', 'API调用开始', {
        url: apiUrl,
        model: model,
        apiKeyPrefix: apiKey.substring(0, 20) + '...'
    });

    const requestBody = {
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
    };

    addLog('DEBUG', 'API_CALL', '请求体', requestBody);

    let response;
    try {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
    } catch (fetchError) {
        addLog('ERROR', 'API_CALL', '网络请求失败', {
            error: fetchError.message,
            code: fetchError.code,
            type: fetchError.type
        });

        throw {
            code: 'NETWORK_ERROR',
            message: `网络请求失败: ${fetchError.message}`,
            details: {
                errorType: fetchError.type,
                errorCode: fetchError.code,
                url: apiUrl
            }
        };
    }

    addLog('INFO', 'API_CALL', `HTTP响应状态: ${response.status}`);

    const responseText = await response.text();
    addLog('DEBUG', 'API_CALL', `响应内容长度: ${responseText.length} 字符`);

    if (!response.ok) {
        addLog('ERROR', 'API_CALL', 'API请求失败', {
            status: response.status,
            statusText: response.statusText,
            response: responseText.substring(0, 1000)
        });

        let errorDetails = {
            httpStatus: response.status,
            statusText: response.statusText,
            url: apiUrl
        };

        let errorMessage = `API 请求失败 (HTTP ${response.status})`;

        try {
            const errorJson = JSON.parse(responseText);
            errorDetails.errorData = errorJson;

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
            errorDetails.rawResponse = responseText.substring(0, 500);
        }

        throw {
            code: `HTTP_${response.status}`,
            message: errorMessage,
            details: errorDetails
        };
    }

    const data = JSON.parse(responseText);
    addLog('INFO', 'API_CALL', 'API调用成功');

    return data;
}

/**
 * 测试 AI API 连接
 */
async function testAIConnection(apiConfig) {
    const { apiProvider, apiKey, customApiUrl, customModel } = apiConfig;

    addLog('INFO', 'TEST', '开始API连接测试', { provider: apiProvider });

    if (!apiKey) {
        throw {
            code: 'MISSING_API_KEY',
            message: 'API Key 未提供',
            details: {}
        };
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

        addLog('INFO', 'TEST', 'API连接测试成功');

        return {
            success: true,
            model: model,
            response: data
        };

    } catch (error) {
        addLog('ERROR', 'TEST', 'API连接测试失败', error);
        throw error;
    }
}

/**
 * 调用 AI API 进行完整的命理分析
 */
async function analyzeWithAI(name, birthdate, birthtime, apiConfig) {
    const { apiProvider, apiKey, customApiUrl, customModel } = apiConfig;

    addLog('INFO', 'ANALYZE', '开始命理分析', {
        name,
        birthdate,
        birthtime,
        provider: apiProvider
    });

    if (!apiKey) {
        throw {
            code: 'MISSING_API_KEY',
            message: 'API Key 未提供',
            details: {}
        };
    }

    try {
        const { apiUrl, model } = getAPIConfig(apiProvider, customApiUrl, customModel);

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

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            addLog('ERROR', 'ANALYZE', 'AI响应格式错误', data);
            throw {
                code: 'INVALID_RESPONSE_FORMAT',
                message: 'AI 响应格式不正确',
                details: { response: data }
            };
        }

        const aiResponse = data.choices[0].message.content;
        addLog('DEBUG', 'ANALYZE', `AI返回内容长度: ${aiResponse.length}`);

        let analysisResult;
        try {
            let cleanedResponse = aiResponse.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
            }

            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanedResponse = jsonMatch[0];
            }

            analysisResult = JSON.parse(cleanedResponse);
            addLog('INFO', 'ANALYZE', 'JSON解析成功');

        } catch (parseError) {
            addLog('ERROR', 'ANALYZE', 'JSON解析失败', {
                error: parseError.message,
                aiResponse: aiResponse.substring(0, 1000)
            });

            throw {
                code: 'JSON_PARSE_ERROR',
                message: 'AI 返回的数据格式不正确',
                details: {
                    parseError: parseError.message,
                    aiResponse: aiResponse.substring(0, 500)
                }
            };
        }

        if (!analysisResult.bazi || !analysisResult.advice) {
            addLog('ERROR', 'ANALYZE', '数据结构不完整', analysisResult);
            throw {
                code: 'INCOMPLETE_DATA',
                message: 'AI 返回的数据不完整',
                details: { result: analysisResult }
            };
        }

        addLog('INFO', 'ANALYZE', '命理分析完成');

        return analysisResult;

    } catch (error) {
        if (!error.code) {
            addLog('ERROR', 'ANALYZE', '未知错误', {
                message: error.message,
                stack: error.stack
            });
            throw {
                code: 'UNKNOWN_ERROR',
                message: error.message || '分析过程中发生未知错误',
                details: { error: error.toString() }
            };
        }
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
                code: 'MISSING_PARAMETERS',
                error: '请配置 AI API 信息'
            });
        }

        if (apiProvider === 'custom' && (!customApiUrl || !customModel)) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_CUSTOM_CONFIG',
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
            code: error.code || 'UNKNOWN_ERROR',
            error: error.message || 'API 测试失败',
            details: error.details || {}
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
                code: 'MISSING_BIRTH_INFO',
                error: '请提供完整的姓名、出生日期和时间'
            });
        }

        if (!apiProvider || !apiKey) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_API_CONFIG',
                error: '请配置 AI API 信息'
            });
        }

        if (apiProvider === 'custom' && (!customApiUrl || !customModel)) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_CUSTOM_CONFIG',
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
            code: error.code || 'UNKNOWN_ERROR',
            error: error.message || '分析过程中发生错误',
            details: error.details || {}
        });
    }
});

/**
 * 获取服务器日志
 */
app.get('/api/logs', (req, res) => {
    res.json({
        success: true,
        logs: logs,
        count: logs.length
    });
});

/**
 * 下载服务器日志
 */
app.get('/api/logs/download', (req, res) => {
    const logText = logs.map(log => {
        const data = log.data ? `\n${JSON.stringify(log.data, null, 2)}` : '';
        return `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}${data}`;
    }).join('\n\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bazi-server-logs-${Date.now()}.txt"`);
    res.send(logText);
});

/**
 * 清除服务器日志
 */
app.post('/api/logs/clear', (req, res) => {
    const count = logs.length;
    logs.length = 0;
    addLog('INFO', 'SYSTEM', `日志已清除 (共 ${count} 条)`);
    res.json({
        success: true,
        message: `已清除 ${count} 条日志`
    });
});

/**
 * 健康检查端点
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        logsCount: logs.length
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
    addLog('INFO', 'SYSTEM', '八字命理分析系统已启动', {
        port: PORT,
        endpoints: {
            analyze: `http://localhost:${PORT}/api/analyze`,
            test: `http://localhost:${PORT}/api/test`,
            logs: `http://localhost:${PORT}/api/logs`,
            logsDownload: `http://localhost:${PORT}/api/logs/download`
        }
    });

    console.log('\n========================================');
    console.log('🔮 八字命理分析系统已启动');
    console.log(`🌐 服务器地址: http://localhost:${PORT}`);
    console.log(`📡 分析端点: http://localhost:${PORT}/api/analyze`);
    console.log(`🧪 测试端点: http://localhost:${PORT}/api/test`);
    console.log(`📋 查看日志: http://localhost:${PORT}/api/logs`);
    console.log(`💾 下载日志: http://localhost:${PORT}/api/logs/download`);
    console.log('');
    console.log('✨ 基于 DeepSeek 官方文档重构');
    console.log('📝 请在前端界面配置您的 API Key');
    console.log('========================================\n');
});

module.exports = app;
