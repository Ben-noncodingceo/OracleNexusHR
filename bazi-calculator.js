/**
 * 八字计算器 - 生辰八字计算核心库
 */

class BaziCalculator {
    constructor() {
        // 天干
        this.tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        // 地支
        this.diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        // 五行
        this.wuXing = {
            '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
            '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
            '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
            '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
            '戌': '土', '亥': '水'
        };
        // 时辰对应表
        this.shiChen = [
            { name: '子时', start: 23, end: 1, index: 0 },
            { name: '丑时', start: 1, end: 3, index: 1 },
            { name: '寅时', start: 3, end: 5, index: 2 },
            { name: '卯时', start: 5, end: 7, index: 3 },
            { name: '辰时', start: 7, end: 9, index: 4 },
            { name: '巳时', start: 9, end: 11, index: 5 },
            { name: '午时', start: 11, end: 13, index: 6 },
            { name: '未时', start: 13, end: 15, index: 7 },
            { name: '申时', start: 15, end: 17, index: 8 },
            { name: '酉时', start: 17, end: 19, index: 9 },
            { name: '戌时', start: 19, end: 21, index: 10 },
            { name: '亥时', start: 21, end: 23, index: 11 }
        ];
        // 星座
        this.zodiacSigns = [
            { name: '摩羯座', start: [12, 22], end: [1, 19] },
            { name: '水瓶座', start: [1, 20], end: [2, 18] },
            { name: '双鱼座', start: [2, 19], end: [3, 20] },
            { name: '白羊座', start: [3, 21], end: [4, 19] },
            { name: '金牛座', start: [4, 20], end: [5, 20] },
            { name: '双子座', start: [5, 21], end: [6, 21] },
            { name: '巨蟹座', start: [6, 22], end: [7, 22] },
            { name: '狮子座', start: [7, 23], end: [8, 22] },
            { name: '处女座', start: [8, 23], end: [9, 22] },
            { name: '天秤座', start: [9, 23], end: [10, 23] },
            { name: '天蝎座', start: [10, 24], end: [11, 22] },
            { name: '射手座', start: [11, 23], end: [12, 21] }
        ];
    }

    /**
     * 计算生辰八字
     * @param {Date} birthDate - 出生日期时间
     * @returns {Object} 八字信息
     */
    calculate(birthDate) {
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthDate.getHours();

        // 计算年柱
        const yearPillar = this.getYearPillar(year);

        // 计算月柱
        const monthPillar = this.getMonthPillar(year, month);

        // 计算日柱
        const dayPillar = this.getDayPillar(year, month, day);

        // 计算时柱
        const hourPillar = this.getHourPillar(dayPillar.ganIndex, hour);

        // 计算星座
        const zodiac = this.getZodiacSign(month, day);

        // 计算月相
        const moonPhase = this.getMoonPhase(year, month, day);

        return {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar,
            zodiac: zodiac,
            moonPhase: moonPhase,
            wuXing: this.getWuXing([yearPillar, monthPillar, dayPillar, hourPillar])
        };
    }

    /**
     * 计算年柱
     */
    getYearPillar(year) {
        // 1984年是甲子年（天干第0位，地支第0位）
        const baseYear = 1984;
        const diff = year - baseYear;

        const ganIndex = ((diff % 10) + 10) % 10;
        const zhiIndex = ((diff % 12) + 12) % 12;

        return {
            gan: this.tianGan[ganIndex],
            zhi: this.diZhi[zhiIndex],
            ganIndex: ganIndex,
            zhiIndex: zhiIndex,
            pillar: this.tianGan[ganIndex] + this.diZhi[zhiIndex]
        };
    }

    /**
     * 计算月柱
     */
    getMonthPillar(year, month) {
        const yearGanIndex = this.getYearPillar(year).ganIndex;

        // 月柱的地支固定：寅月(正月)开始
        // 注意：农历和公历有差异，这里简化处理
        let zhiIndex = (month + 1) % 12; // 简化：正月为寅月

        // 月干的计算：根据年干推月干
        // 甲己之年丙作首（正月起丙寅）
        // 乙庚之岁戊为头（正月起戊寅）
        // 丙辛岁首寻庚起（正月起庚寅）
        // 丁壬壬位顺行流（正月起壬寅）
        // 戊癸甲寅好追求（正月起甲寅）
        const monthGanStart = [2, 4, 6, 8, 0]; // 丙戊庚壬甲
        const ganGroup = yearGanIndex % 5;
        let ganIndex = (monthGanStart[ganGroup] + month - 1) % 10;

        return {
            gan: this.tianGan[ganIndex],
            zhi: this.diZhi[zhiIndex],
            ganIndex: ganIndex,
            zhiIndex: zhiIndex,
            pillar: this.tianGan[ganIndex] + this.diZhi[zhiIndex]
        };
    }

    /**
     * 计算日柱（使用简化的万年历算法）
     */
    getDayPillar(year, month, day) {
        // 使用基准日期：1900年1月1日为甲戌日
        const baseDate = new Date(1900, 0, 1);
        const currentDate = new Date(year, month - 1, day);

        const diffDays = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));

        // 1900年1月1日是甲戌日，天干索引9，地支索引10
        const ganIndex = (9 + diffDays) % 10;
        const zhiIndex = (10 + diffDays) % 12;

        return {
            gan: this.tianGan[ganIndex],
            zhi: this.diZhi[zhiIndex],
            ganIndex: ganIndex,
            zhiIndex: zhiIndex,
            pillar: this.tianGan[ganIndex] + this.diZhi[zhiIndex]
        };
    }

    /**
     * 计算时柱
     */
    getHourPillar(dayGanIndex, hour) {
        // 确定时辰地支
        let zhiIndex = 0;
        for (let sc of this.shiChen) {
            if (hour >= sc.start && hour < sc.end) {
                zhiIndex = sc.index;
                break;
            }
            // 处理子时跨越午夜的情况
            if (hour >= 23 || hour < 1) {
                zhiIndex = 0;
                break;
            }
        }

        // 时干的计算：根据日干推时干
        // 甲己还加甲（子时起甲子）
        // 乙庚丙作初（子时起丙子）
        // 丙辛从戊起（子时起戊子）
        // 丁壬庚子居（子时起庚子）
        // 戊癸何方发，壬子是真途（子时起壬子）
        const hourGanStart = [0, 2, 4, 6, 8]; // 甲丙戊庚壬
        const ganGroup = dayGanIndex % 5;
        const ganIndex = (hourGanStart[ganGroup] + zhiIndex) % 10;

        return {
            gan: this.tianGan[ganIndex],
            zhi: this.diZhi[zhiIndex],
            ganIndex: ganIndex,
            zhiIndex: zhiIndex,
            pillar: this.tianGan[ganIndex] + this.diZhi[zhiIndex]
        };
    }

    /**
     * 计算星座
     */
    getZodiacSign(month, day) {
        for (let sign of this.zodiacSigns) {
            const [startMonth, startDay] = sign.start;
            const [endMonth, endDay] = sign.end;

            if (month === startMonth && day >= startDay) {
                return sign.name;
            }
            if (month === endMonth && day <= endDay) {
                return sign.name;
            }
        }
        return '摩羯座'; // 默认
    }

    /**
     * 计算月相（简化算法）
     */
    getMoonPhase(year, month, day) {
        // 使用简化的月相计算
        const date = new Date(year, month - 1, day);
        const baseDate = new Date(2000, 0, 6); // 2000年1月6日是新月
        const diff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
        const lunarDay = diff % 29.53;

        if (lunarDay < 1.84) return '新月 🌑';
        if (lunarDay < 7.38) return '娥眉月 🌒';
        if (lunarDay < 9.23) return '上弦月 🌓';
        if (lunarDay < 14.77) return '盈凸月 🌔';
        if (lunarDay < 16.61) return '满月 🌕';
        if (lunarDay < 22.15) return '亏凸月 🌖';
        if (lunarDay < 23.99) return '下弦月 🌗';
        if (lunarDay < 29.53) return '残月 🌘';
        return '新月 🌑';
    }

    /**
     * 分析五行
     */
    getWuXing(pillars) {
        const count = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

        pillars.forEach(pillar => {
            const ganWuXing = this.wuXing[pillar.gan];
            const zhiWuXing = this.wuXing[pillar.zhi];
            count[ganWuXing]++;
            count[zhiWuXing]++;
        });

        return count;
    }

    /**
     * 格式化输出
     */
    format(bazi) {
        return {
            yearPillar: bazi.year.pillar,
            monthPillar: bazi.month.pillar,
            dayPillar: bazi.day.pillar,
            hourPillar: bazi.hour.pillar,
            zodiac: bazi.zodiac,
            moonPhase: bazi.moonPhase,
            wuXing: bazi.wuXing,
            fullBazi: `${bazi.year.pillar} ${bazi.month.pillar} ${bazi.day.pillar} ${bazi.hour.pillar}`
        };
    }
}

// 导出供使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaziCalculator;
}
