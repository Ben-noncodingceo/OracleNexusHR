/**
 * Cloudflare Pages Function - API 测试
 * 测试 AI API 连接是否正常
 */

// CORS 配置
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

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
 * Cloudflare Pages Function 导出
 */
export async function onRequestPost(context) {
    try {
        // 解析请求体
        const requestData = await context.request.json();

        const {
            apiProvider,
            apiKey,
            customApiUrl,
            customModel
        } = requestData;

        if (!apiKey) {
            throw new Error('请提供 API Key');
        }

        // 获取 API 配置
        const { apiUrl, model } = getAPIConfig(apiProvider, customApiUrl, customModel);

        // 发送测试请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: '你是一个测试助手。' },
                    { role: 'user', content: '请回复"测试成功"来确认连接正常。' }
                ],
                max_tokens: 50,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
            }
            throw new Error(errorData.error?.message || `API 请求失败 (${response.status})`);
        }

        const data = await response.json();

        // 返回成功响应
        return new Response(JSON.stringify({
            success: true,
            model: model,
            message: 'API 连接成功'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        console.error('API 测试错误:', error);

        // 返回错误响应
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'API 测试失败',
            code: 'API_TEST_ERROR'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}

/**
 * 处理 OPTIONS 请求（CORS 预检）
 */
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}
