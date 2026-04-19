/**
 * src/core/tierCalculator.js
 * 레이팅 -> 백준 티어 아이콘 경로 변환기
 */
window.BOJ_CF.TierCalculator = (function() {
    return {
        getUserTierIcon: (rating) => {
            if (!rating || rating === 'Unrated' || rating === '?') return 'icons/no_rating.svg';
            const r = parseInt(rating);
            if (isNaN(r) || r === 0) return 'icons/no_rating.svg';
            
            // 100점 단위 정밀 타겟팅
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
        },
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