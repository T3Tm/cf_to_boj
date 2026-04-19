/**
 * src/core/tierCalculator.js
 * 레이팅 -> 백준 티어 아이콘 경로 변환기
 */
window.BOJ_CF.TierCalculator = (function() {
    return {
        getUserTierIcon: (rating) => {
            if (!rating) return 'icons/no_rating.svg';
            const r = parseInt(rating);
            if (isNaN(r) || r === 0) return 'icons/no_rating.svg';
            
            if (r < 1200) return `icons/bronze${5 - Math.floor(r / 240)}.svg`;
            if (r < 1400) return `icons/silver${5 - Math.floor((r - 1200) / 40)}.svg`;
            if (r < 1600) return `icons/gold${5 - Math.floor((r - 1400) / 40)}.svg`;
            if (r < 1900) return `icons/platinum${5 - Math.floor((r - 1600) / 60)}.svg`;
            if (r < 2100) return `icons/diamond${5 - Math.floor((r - 1900) / 40)}.svg`;
            if (r < 2400) return `icons/ruby${5 - Math.floor((r - 2100) / 60)}.svg`;
            return 'icons/master.svg'; 
        },

        getProblemTierIcon: (rating) => {
            if (!rating || rating === '?') return 'icons/question_mark.svg';
            const r = parseInt(rating);
            if (isNaN(r) || r === 0) return 'icons/question_mark.svg';
            
            if (r < 900) return 'icons/bronze5.svg';
            if (r < 1400) return `icons/bronze${4 - Math.floor((r - 900) / 100)}.svg`;
            if (r < 1900) return `icons/silver${5 - Math.floor((r - 1400) / 100)}.svg`;
            if (r < 2400) return `icons/gold${5 - Math.floor((r - 1900) / 100)}.svg`;
            if (r < 2900) return `icons/platinum${5 - Math.floor((r - 2400) / 100)}.svg`;
            if (r < 3400) return `icons/diamond${5 - Math.floor((r - 2900) / 100)}.svg`;
            if (r < 3900) return `icons/ruby${5 - Math.floor((r - 3400) / 100)}.svg`;
            return 'icons/ruby1.svg'; 
        }
    };
})();