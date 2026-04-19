/**
 * src/core/tierCalculator.js
 * 백준 티어 변환 핵심 비즈니스 로직
 */
window.BOJ_CF.TierCalculator = (function() {
    return {
        // 1. 유저 티어 계산
        getUserTierIcon: (rating) => {
            if (!rating) return 'icons/norating.svg';
            const r = parseInt(rating);
            if (isNaN(r) || r === 0) return 'icons/norating.svg';
            
            if (r < 1200) {
                if (r < 1000) return 'icons/bronze5.svg';
                if (r < 1050) return 'icons/bronze4.svg';
                if (r < 1100) return 'icons/bronze3.svg';
                if (r < 1150) return 'icons/bronze2.svg';
                return 'icons/bronze1.svg';
            }
            if (r < 1400) {
                if (r < 1240) return 'icons/silver5.svg';
                if (r < 1280) return 'icons/silver4.svg';
                if (r < 1320) return 'icons/silver3.svg';
                if (r < 1360) return 'icons/silver2.svg';
                return 'icons/silver1.svg';
            }
            if (r < 1600) {
                if (r < 1440) return 'icons/gold5.svg';
                if (r < 1480) return 'icons/gold4.svg';
                if (r < 1520) return 'icons/gold3.svg';
                if (r < 1560) return 'icons/gold2.svg';
                return 'icons/gold1.svg';
            }
            if (r < 1900) {
                if (r < 1660) return 'icons/platinum5.svg';
                if (r < 1720) return 'icons/platinum4.svg';
                if (r < 1780) return 'icons/platinum3.svg';
                if (r < 1840) return 'icons/platinum2.svg';
                return 'icons/platinum1.svg';
            }
            if (r < 2100) {
                if (r < 1940) return 'icons/diamond5.svg';
                if (r < 1980) return 'icons/diamond4.svg';
                if (r < 2020) return 'icons/diamond3.svg';
                if (r < 2060) return 'icons/diamond2.svg';
                return 'icons/diamond1.svg';
            }
            if (r < 2400) {
                if (r < 2160) return 'icons/ruby5.svg';
                if (r < 2220) return 'icons/ruby4.svg';
                if (r < 2280) return 'icons/ruby3.svg';
                if (r < 2340) return 'icons/ruby2.svg';
                return 'icons/ruby1.svg';
            }
            return 'icons/master.svg'; 
        },

        // 2. 문제 난이도 계산 (100점 단위)
        getProblemTierIcon: (rating) => {
            if (!rating || rating === '?') return 'icons/question_mark.svg';
            const r = parseInt(rating);
            if (isNaN(r) || r === 0) return 'icons/question_mark.svg';
            
            if (r < 900) return 'icons/bronze5.svg';
            if (r < 1000) return 'icons/bronze4.svg';
            if (r < 1100) return 'icons/bronze3.svg';
            if (r < 1200) return 'icons/bronze2.svg';
            if (r < 1300) return 'icons/bronze1.svg';
            if (r < 1400) return 'icons/silver5.svg';
            if (r < 1500) return 'icons/silver4.svg';
            if (r < 1600) return 'icons/silver3.svg';
            if (r < 1700) return 'icons/silver2.svg';
            if (r < 1800) return 'icons/silver1.svg';
            if (r < 1900) return 'icons/gold5.svg';
            if (r < 2000) return 'icons/gold4.svg';
            if (r < 2100) return 'icons/gold3.svg';
            if (r < 2200) return 'icons/gold2.svg';
            if (r < 2300) return 'icons/gold1.svg';
            if (r < 2400) return 'icons/platinum5.svg';
            if (r < 2500) return 'icons/platinum4.svg';
            if (r < 2600) return 'icons/platinum3.svg';
            if (r < 2700) return 'icons/platinum2.svg';
            if (r < 2800) return 'icons/platinum1.svg';
            if (r < 2900) return 'icons/diamond5.svg';
            if (r < 3000) return 'icons/diamond4.svg';
            if (r < 3100) return 'icons/diamond3.svg';
            if (r < 3200) return 'icons/diamond2.svg';
            if (r < 3300) return 'icons/diamond1.svg';
            if (r < 3400) return 'icons/ruby5.svg';
            if (r < 3500) return 'icons/ruby4.svg';
            return 'icons/ruby3.svg'; 
        }
    };
})();