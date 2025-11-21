/**
 * Cloudflare Pages Function - 八字分析 API
 * 处理前端分析请求，调用 AI API
 */

// CORS 配置
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * 调用 AI API
 */
async function callAIAPI(apiUrl, apiKey, model, messages, maxTokens = 2000) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: maxTokens,
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

    return await response.json();
}

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
 * 识别城市地理信息
 */
async function identifyCityLocation(cityName, apiUrl, apiKey, model) {
    const messages = [
        {
            role: 'system',
            content: '你是一个地理信息专家，精通中国各省市的地理位置信息。你总是以纯JSON格式返回结果，不包含任何markdown标记或其他额外文字。'
        },
        {
            role: 'user',
            content: `请识别以下城市的地理信息：${cityName}

【要求】
1. 识别城市所在的省份/自治区/直辖市
2. 提供城市的经纬度坐标（精确到小数点后1位）
3. 如果是县级市或区，请给出地级市名称

返回纯JSON格式（不要任何markdown标记）：
{
  "city": "城市名称（标准名称）",
  "province": "所在省份/自治区/直辖市",
  "latitude": 纬度数字（小数点后1位，如39.9）,
  "longitude": 经度数字（小数点后1位，如116.4）
}

请立即返回JSON结果：`
        }
    ];

    try {
        const data = await callAIAPI(apiUrl, apiKey, model, messages, 200);
        let responseText = data.choices[0].message.content.trim();

        // 清理 markdown 标记
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        // 提取 JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            responseText = jsonMatch[0];
        }

        const locationInfo = JSON.parse(responseText);

        // 确保精度为1位小数
        locationInfo.latitude = Math.round(locationInfo.latitude * 10) / 10;
        locationInfo.longitude = Math.round(locationInfo.longitude * 10) / 10;

        return locationInfo;

    } catch (error) {
        console.error('城市识别失败:', error);
        // 返回默认值，不阻塞流程
        return {
            city: cityName,
            province: '未知',
            latitude: 0,
            longitude: 0
        };
    }
}

/**
 * 进行八字分析
 */
async function analyzeWithAI(name, gender, birthdate, birthtime, birthCity, apiProvider, apiKey, customApiUrl, customModel) {
    // 验证输入
    if (!name || !gender || !birthdate || !birthtime || !birthCity) {
        throw new Error('请填写完整的个人信息');
    }

    if (!apiKey) {
        throw new Error('请提供 API Key');
    }

    // 获取 API 配置
    const { apiUrl, model } = getAPIConfig(apiProvider, customApiUrl, customModel);

    // 第一步：识别城市位置
    const locationInfo = await identifyCityLocation(birthCity, apiUrl, apiKey, model);

    // 第二步：进行八字分析
    const systemPrompt = `你是一位精通中国传统命理学的大师，精通生辰八字、五行八卦、星座学、月相学和真太阳时计算。你必须以纯JSON格式返回结果，不包含任何markdown标记或其他额外文字。`;

    const userPrompt = `你是一位精通中国传统命理学的大师，精通生辰八字、五行八卦、星座学、月相学和真太阳时计算。

【任务】
请根据以下信息进行完整且精确的命理分析：

【个人信息】
- 姓名：${name}
- 性别：${gender}
- 出生日期：${birthdate}（公历）
- 出生时间：${birthtime}（24小时制，当地时间）

【出生地信息】（用于精确计算真太阳时）
- 出生城市：${locationInfo.city}
- 所在省份：${locationInfo.province}
- 地理坐标：北纬 ${locationInfo.latitude}°, 东经 ${locationInfo.longitude}°

【重要计算要求】
1. **真太阳时校正**：根据经度 ${locationInfo.longitude}° 计算真太阳时，北京时间（东经120°）与当地时间差 = (120 - ${locationInfo.longitude}) / 15 小时
2. **时柱计算**：必须基于真太阳时确定正确的时辰（子丑寅卯辰巳午未申酉戌亥）
3. **性别特征**：根据性别 ${gender} 调整命理分析的侧重点和建议

【分析内容要求】
1. **生辰八字**：准确计算年柱、月柱、日柱、时柱（基于真太阳时）
2. **命理建议**：200字左右，结合八字特点给出人生建议
3. **星座分析**：根据出生日期判断星座，给出运势建议（150字）
4. **月相指引**：根据农历日期判断月相，给出指引建议（150字）

【输出格式】
你必须返回纯JSON格式（不要任何markdown标记如\`\`\`json），结构如下：

{
  "bazi": {
    "yearPillar": "年柱（天干地支）",
    "monthPillar": "月柱（天干地支）",
    "dayPillar": "日柱（天干地支）",
    "hourPillar": "时柱（天干地支，基于真太阳时）",
    "zodiac": "星座名称",
    "moonPhase": "月相名称"
  },
  "advice": "200字左右的命理建议",
  "zodiacAdvice": "150字左右的星座运势建议",
  "moonAdvice": "150字左右的月相指引建议"
}

请立即返回JSON结果（不要markdown标记）：`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    const data = await callAIAPI(apiUrl, apiKey, model, messages, 2000);

    let responseText = data.choices[0].message.content.trim();

    // 清理 markdown 标记
    if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // 提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        responseText = jsonMatch[0];
    }

    const analysisResult = JSON.parse(responseText);

    // 验证必要字段
    if (!analysisResult.bazi || !analysisResult.advice) {
        throw new Error('AI 返回的数据格式不完整');
    }

    // 构建完整结果
    return {
        name: name,
        gender: gender,
        birthdate: birthdate,
        birthtime: birthtime,
        birthCity: birthCity,
        location: locationInfo,
        bazi: analysisResult.bazi,
        advice: analysisResult.advice,
        zodiacAdvice: analysisResult.zodiacAdvice || '暂无星座建议',
        moonAdvice: analysisResult.moonAdvice || '暂无月相建议'
    };
}

/**
 * Cloudflare Pages Function 导出
 */
export async function onRequestPost(context) {
    try {
        // 解析请求体
        const requestData = await context.request.json();

        const {
            name,
            gender,
            birthdate,
            birthtime,
            birthCity,
            apiProvider,
            apiKey,
            customApiUrl,
            customModel
        } = requestData;

        // 调用分析函数
        const result = await analyzeWithAI(
            name,
            gender,
            birthdate,
            birthtime,
            birthCity,
            apiProvider,
            apiKey,
            customApiUrl,
            customModel
        );

        // 返回成功响应
        return new Response(JSON.stringify({
            success: true,
            data: result
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        console.error('分析错误:', error);

        // 返回错误响应
        return new Response(JSON.stringify({
            success: false,
            error: error.message || '分析失败',
            code: 'ANALYSIS_ERROR'
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
