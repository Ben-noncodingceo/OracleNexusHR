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

    // 测试 API 连接
    testApiBtn.addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value;

        if (!apiKey) {
            showApiStatus('请先输入 API Key', 'error');
            return;
        }

        const apiConfig = {
            apiProvider: apiProvider.value,
            apiKey: apiKey
        };

        if (apiProvider.value === 'custom') {
            if (!customApiUrl.value || !customModel.value) {
                showApiStatus('请填写完整的自定义 API 配置', 'error');
                return;
            }
            apiConfig.customApiUrl = customApiUrl.value;
            apiConfig.customModel = customModel.value;
        }

        // 显示测试中状态
        showApiStatus('⏳ 正在测试 API 连接...', 'testing');
        testApiBtn.disabled = true;

        try {
            let response;
            try {
                response = await fetch('/api/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(apiConfig)
                });
            } catch (fetchError) {
                throw new Error(`网络连接失败: ${fetchError.message}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error(`服务器返回数据格式错误 (HTTP ${response.status})`);
            }

            if (!response.ok) {
                const errorMsg = data.error || 'API 测试失败';
                const errorCode = data.code ? ` [${data.code}]` : '';
                throw new Error(errorMsg + errorCode);
            }

            if (data.success) {
                showApiStatus(`✅ API 连接成功！模型：${data.model || '未知'}`, 'success');
            } else {
                const errorMsg = data.error || 'API 测试失败';
                const errorCode = data.code ? ` [${data.code}]` : '';
                throw new Error(errorMsg + errorCode);
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
            birthdate: document.getElementById('birthdate').value,
            birthtime: document.getElementById('birthtime').value,
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
            console.log('发送分析请求:', {
                name: formData.name,
                birthdate: formData.birthdate,
                birthtime: formData.birthtime,
                apiProvider: formData.apiProvider
            });

            // 发送请求到后端
            let response;
            try {
                response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } catch (fetchError) {
                // 网络错误
                const error = new Error('网络连接失败，请检查网络连接');
                error.code = 'NETWORK_ERROR';
                error.details = {
                    errorType: fetchError.name,
                    errorMessage: fetchError.message
                };
                throw error;
            }

            console.log('收到响应状态:', response.status);

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                // JSON 解析错误
                const error = new Error('服务器返回数据格式错误');
                error.code = 'JSON_PARSE_ERROR';
                error.details = {
                    httpStatus: response.status,
                    errorMessage: jsonError.message
                };
                throw error;
            }
            console.log('解析的数据:', data);

            if (!response.ok) {
                // 创建包含详细信息的错误对象
                const error = new Error(data.error || `请求失败 (${response.status})`);
                error.code = data.code || `HTTP_${response.status}`;
                error.details = data.details || null;
                throw error;
            }

            if (data.success) {
                // 显示结果
                displayResult(data.data);
            } else {
                // 创建包含详细信息的错误对象
                const error = new Error(data.error || '分析失败');
                error.code = data.code || 'UNKNOWN_ERROR';
                error.details = data.details || null;
                throw error;
            }

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
        alert('❌ 下载日志失败: ' + err.message);
    }
}
