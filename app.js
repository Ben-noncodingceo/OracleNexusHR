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
            // 发送请求到后端
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            if (data.success) {
                // 显示结果
                displayResult(data.data);
            } else {
                throw new Error(data.error || '分析失败');
            }

        } catch (err) {
            console.error('Error:', err);
            showError(err.message || '发生未知错误，请稍后重试');
        } finally {
            loading.classList.remove('active');
            submitBtn.disabled = false;
        }
    });

    /**
     * 显示分析结果
     */
    function displayResult(data) {
        // 基本信息
        document.getElementById('resultName').textContent = data.name;
        document.getElementById('resultGender').textContent = data.gender || '未知';
        document.getElementById('resultDate').textContent = data.birthdate;
        document.getElementById('resultTime').textContent = data.birthtime;

        // 八字四柱
        document.getElementById('yearPillar').textContent = data.bazi.yearPillar;
        document.getElementById('monthPillar').textContent = data.bazi.monthPillar;
        document.getElementById('dayPillar').textContent = data.bazi.dayPillar;
        document.getElementById('hourPillar').textContent = data.bazi.hourPillar;

        // 星座和月相
        document.getElementById('zodiac').textContent = data.bazi.zodiac;
        document.getElementById('moonPhase').textContent = data.bazi.moonPhase;

        // AI 生成的建议
        document.getElementById('advice').textContent = data.advice;
        document.getElementById('zodiacAdvice').textContent = data.zodiacAdvice;
        document.getElementById('moonAdvice').textContent = data.moonAdvice;

        // 显示结果区域
        result.classList.add('active');

        // 滚动到结果区域
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * 显示错误信息
     */
    function showError(message) {
        error.textContent = `❌ 错误: ${message}`;
        error.classList.add('active');
        error.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
