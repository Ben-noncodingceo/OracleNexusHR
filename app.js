/**
 * 前端应用逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('baziForm');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    const submitBtn = document.getElementById('submitBtn');

    // 设置今天的日期作为默认值
    const today = new Date();
    const dateInput = document.getElementById('birthdate');
    if (dateInput) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }

    // 表单提交处理
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 获取表单数据
        const formData = {
            name: document.getElementById('name').value,
            birthdate: document.getElementById('birthdate').value,
            birthtime: document.getElementById('birthtime').value,
            apiType: 'deepseek' // 默认使用 DeepSeek，可以改为 'openai'
        };

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
        document.getElementById('resultGender').textContent = '未知'; // 可以扩展性别识别
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
