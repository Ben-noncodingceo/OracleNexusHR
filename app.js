/**
 * 前端应用逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('baziForm');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    const submitBtn = document.getElementById('submitBtn');
    const apiProvider = document.getElementById('apiProvider');
    const customApiUrlGroup = document.getElementById('customApiUrlGroup');
    const customModelGroup = document.getElementById('customModelGroup');
    const customApiUrl = document.getElementById('customApiUrl');
    const customModel = document.getElementById('customModel');
    const testApiBtn = document.getElementById('testApiBtn');
    const apiStatus = document.getElementById('apiStatus');
    const serverStatus = document.getElementById('serverStatus');

    // 检查服务器状态
    checkServerStatus();

    // 设置今天的日期作为默认值
    const today = new Date();
    const dateInput = document.getElementById('birthdate');
    if (dateInput) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }

    // 监听 API 提供商选择变化
    apiProvider.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customApiUrlGroup.classList.remove('hidden');
            customModelGroup.classList.remove('hidden');
            customApiUrl.required = true;
            customModel.required = true;
        } else {
            customApiUrlGroup.classList.add('hidden');
            customModelGroup.classList.add('hidden');
            customApiUrl.required = false;
            customModel.required = false;
        }
        // 清除之前的 API 状态
        apiStatus.classList.remove('active');
    });

    // 监听 API Key 和其他配置变化，清除测试状态
    document.getElementById('apiKey').addEventListener('input', () => {
        apiStatus.classList.remove('active');
    });

    // 测试 API 连接（支持后端代理和直接调用）
    testApiBtn.addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value;

        if (!apiKey) {
            showApiStatus('请先输入 API Key', 'error');
            return;
        }

        const provider = apiProvider.value;

        if (provider === 'custom') {
            if (!customApiUrl.value || !customModel.value) {
                showApiStatus('请填写完整的自定义 API 配置', 'error');
                return;
            }
        }

        // 显示测试中状态
        showApiStatus('⏳ 正在测试 API 连接...', 'testing');
        testApiBtn.disabled = true;

        try {
            // 优先尝试使用后端 API（Cloudflare/Vercel）
            const useBackend = await checkBackendAvailable();

            if (useBackend) {
                console.log('使用后端 API 进行测试');
                const response = await fetch('/api/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        apiProvider: provider,
                        apiKey: apiKey,
                        customApiUrl: customApiUrl.value,
                        customModel: customModel.value
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showApiStatus(`✅ API 连接成功！模型：${data.model}`, 'success');
                } else {
                    throw new Error(data.error || 'API 测试失败');
                }
            } else {
                console.log('使用前端直接调用进行测试');
                // 回退到直接调用（GitHub Pages）
                const { apiUrl, model } = getAPIConfig(provider, customApiUrl.value, customModel.value);

                const messages = [
                    { role: 'system', content: '你是一个测试助手。' },
                    { role: 'user', content: '请回复"测试成功"来确认连接正常。' }
                ];

                const data = await callAIAPI(apiUrl, apiKey, model, messages, 50);

                if (data && data.choices && data.choices[0]) {
                    showApiStatus(`✅ API 连接成功！模型：${model}`, 'success');
                } else {
                    throw new Error('API 返回数据格式异常');
                }
            }

        } catch (err) {
            console.error('API Test Error:', err);
            showApiStatus(`❌ API 连接失败：${err.message}`, 'error');
        } finally {
            testApiBtn.disabled = false;
        }
    });

    // 表单提交处理
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 获取表单数据
        const formData = {
            name: document.getElementById('name').value,
            gender: document.getElementById('gender').value,
            birthdate: document.getElementById('birthdate').value,
            birthtime: document.getElementById('birthtime').value,
            birthCity: document.getElementById('birthCity').value,
            apiProvider: apiProvider.value,
            apiKey: document.getElementById('apiKey').value
        };

        // 如果选择自定义 API，添加额外字段
        if (formData.apiProvider === 'custom') {
            formData.customApiUrl = customApiUrl.value;
            formData.customModel = customModel.value;
        }

        // 显示加载状态
        loading.classList.add('active');
        result.classList.remove('active');
        error.classList.remove('active');
        submitBtn.disabled = true;

        try {
            console.log('开始分析请求:', {
                name: formData.name,
                gender: formData.gender,
                birthdate: formData.birthdate,
                birthtime: formData.birthtime,
                birthCity: formData.birthCity,
                apiProvider: formData.apiProvider
            });

            let analysisResult;

            // 优先尝试使用后端 API（Cloudflare/Vercel）
            const useBackend = await checkBackendAvailable();

            if (useBackend) {
                console.log('使用后端 API 进行分析');
                // 使用后端代理（避免 CORS 问题）
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || '分析失败');
                }

                analysisResult = data.data;
            } else {
                console.log('使用前端直接调用进行分析');
                // 回退到前端直接调用（GitHub Pages）
                analysisResult = await analyzeWithAIDirect(
                    formData.name,
                    formData.gender,
                    formData.birthdate,
                    formData.birthtime,
                    formData.birthCity,
                    formData.apiProvider,
                    formData.apiKey,
                    formData.customApiUrl,
                    formData.customModel
                );
            }

            // 显示结果
            displayResult(analysisResult);

        } catch (err) {
            console.error('Analysis Error:', err);

            // 提取错误信息
            let errorMessage = err.message || '发生未知错误，请稍后重试';
            let errorCode = null;
            let errorDetails = null;

            // 如果错误对象包含详细信息，提取它们
            if (err.code) {
                errorCode = err.code;
            }

            if (err.details) {
                errorDetails = err.details;
            }

            showError(errorMessage, errorCode, errorDetails);
        } finally {
            loading.classList.remove('active');
            submitBtn.disabled = false;
        }
    });

    /**
     * 显示 API 状态
     */
    function showApiStatus(message, type) {
        apiStatus.textContent = message;
        apiStatus.className = 'api-status active ' + type;
    }

    /**
     * 显示分析结果
     */
    function displayResult(data) {
        console.log('显示结果:', data);

        // 基本信息
        document.getElementById('resultName').textContent = data.name;
        document.getElementById('resultGender').textContent = data.gender || '未知';
        document.getElementById('resultDate').textContent = data.birthdate;
        document.getElementById('resultTime').textContent = data.birthtime;

        // 地理信息
        if (data.location) {
            document.getElementById('resultCity').textContent = data.location.city || data.birthCity || '未知';
            document.getElementById('resultProvince').textContent = data.location.province || '未知';
            const coords = data.location.latitude && data.location.longitude
                ? `北纬 ${data.location.latitude}°, 东经 ${data.location.longitude}°`
                : '未知';
            document.getElementById('resultCoordinates').textContent = coords;
        } else {
            document.getElementById('resultCity').textContent = data.birthCity || '未知';
            document.getElementById('resultProvince').textContent = '未知';
            document.getElementById('resultCoordinates').textContent = '未知';
        }

        // 八字四柱
        document.getElementById('yearPillar').textContent = data.bazi.yearPillar || '计算中';
        document.getElementById('monthPillar').textContent = data.bazi.monthPillar || '计算中';
        document.getElementById('dayPillar').textContent = data.bazi.dayPillar || '计算中';
        document.getElementById('hourPillar').textContent = data.bazi.hourPillar || '计算中';

        // 星座和月相
        document.getElementById('zodiac').textContent = data.bazi.zodiac || '未知';
        document.getElementById('moonPhase').textContent = data.bazi.moonPhase || '未知';

        // AI 生成的建议
        document.getElementById('advice').textContent = data.advice || '暂无建议';
        document.getElementById('zodiacAdvice').textContent = data.zodiacAdvice || '暂无建议';
        document.getElementById('moonAdvice').textContent = data.moonAdvice || '暂无建议';

        // 显示结果区域
        result.classList.add('active');

        // 滚动到结果区域
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * 显示错误信息
     */
    function showError(message, errorCode = null, details = null) {
        let errorHtml = `❌ 错误: ${message}`;

        if (errorCode) {
            errorHtml += `<br><strong>错误代码:</strong> ${errorCode}`;
        }

        if (details) {
            errorHtml += '<br><strong>详细信息:</strong><br>';
            if (typeof details === 'object') {
                errorHtml += '<pre style="background: #fff; padding: 10px; border-radius: 5px; margin-top: 5px; overflow-x: auto;">' +
                             JSON.stringify(details, null, 2) +
                             '</pre>';
            } else {
                errorHtml += details;
            }
        }

        error.innerHTML = errorHtml;
        error.classList.add('active');
        error.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

/**
 * 下载服务器日志
 */
async function downloadLogs() {
    try {
        const response = await fetch('/api/logs/download');

        if (!response.ok) {
            throw new Error('下载日志失败');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bazi-server-logs-${new Date().toISOString().replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('✅ 日志文件下载成功！');
    } catch (err) {
        console.error('Download logs error:', err);
        alert('❌ 下载日志失败: ' + err.message + '\n\n请确保服务器正在运行！\n运行命令: npm start');
    }
}

/**
 * 检查后端 API 是否可用（用于自动选择调用方式）
 */
let backendAvailableCache = null; // 缓存检测结果

async function checkBackendAvailable() {
    // 如果已经检测过，返回缓存结果
    if (backendAvailableCache !== null) {
        return backendAvailableCache;
    }

    try {
        // 尝试访问后端健康检查端点（快速超时）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2秒超时

        const response = await fetch('/api/test', {
            method: 'OPTIONS', // 使用 OPTIONS 检查端点是否存在
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 如果响应成功或返回 204（Cloudflare Functions 的 CORS 响应），说明后端可用
        backendAvailableCache = response.ok || response.status === 204;
        console.log('后端 API 检测结果:', backendAvailableCache ? '可用' : '不可用');
        return backendAvailableCache;

    } catch (error) {
        // 超时或网络错误，说明后端不可用
        console.log('后端 API 不可用，将使用前端直接调用');
        backendAvailableCache = false;
        return false;
    }
}

/**
 * 检查服务器状态（自动检测环境）
 */
async function checkServerStatus() {
    const serverStatus = document.getElementById('serverStatus');
    if (!serverStatus) return;

    // 检测后端是否可用
    const backendAvailable = await checkBackendAvailable();

    if (backendAvailable) {
        // 有后端 API（Cloudflare/Vercel）
        serverStatus.innerHTML = '🟢 后端 API 可用（推荐模式）';
        serverStatus.className = 'server-status online';
        serverStatus.style.display = 'block';
        console.log('运行模式: 后端代理（Cloudflare/Vercel）');
    } else {
        // 纯前端模式（GitHub Pages）
        serverStatus.innerHTML = '🔵 前端直接调用模式（GitHub Pages）';
        serverStatus.className = 'server-status direct-mode';
        serverStatus.style.display = 'block';
        console.log('运行模式: 前端直接调用（GitHub Pages）');
    }
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
 * 直接调用 AI API
 */
async function callAIAPI(apiUrl, apiKey, model, messages, maxTokens = 2000) {
    console.log('调用 AI API:', { apiUrl, model, messagesCount: messages.length });

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 请求失败 (${response.status})`);
    }

    return await response.json();
}

/**
 * 识别城市地理信息
 */
async function identifyCityLocation(cityName, apiUrl, apiKey, model) {
    console.log('识别城市信息:', cityName);

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

        console.log('城市识别成功:', locationInfo);
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
 * 直接使用 AI 进行八字分析（前端版本）
 */
async function analyzeWithAIDirect(name, gender, birthdate, birthtime, birthCity, apiProvider, apiKey, customApiUrl, customModel) {
    console.log('开始八字分析...');

    // 验证输入
    if (!name || !gender || !birthdate || !birthtime || !birthCity) {
        throw new Error('请填写完整的个人信息');
    }

    if (!apiKey) {
        throw new Error('请提供 API Key');
    }

    try {
        // 获取 API 配置
        const { apiUrl, model } = getAPIConfig(apiProvider, customApiUrl, customModel);
        console.log('使用 API:', { apiUrl, model });

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

        console.log('发送八字分析请求...');
        const data = await callAIAPI(apiUrl, apiKey, model, messages, 2000);

        let responseText = data.choices[0].message.content.trim();
        console.log('收到 AI 响应');

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
        const result = {
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

        console.log('八字分析完成');
        return result;

    } catch (error) {
        console.error('分析失败:', error);
        throw new Error(`分析失败: ${error.message}`);
    }
}
