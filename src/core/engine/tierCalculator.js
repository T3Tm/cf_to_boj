/**
 * src/core/engine/tierCalculator.js (v4.0.0)
 * [Pure Logic] 코드포스 Rating -> 백준 스타일 티어 환산 엔진
 * 
 * 1. 문제 티어: 800점(B5)부터 100점당 1단계씩 상승 (선형 매핑)
 * 2. 유저 티어: 공식 등급 구간(Newbie~LGM)에 따른 티어 부여
 */
window.BOJ_CF.TierCalculator = (function() {
    const TIER_NAMES = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby'];

    /**
     * 유저 등급별 레이팅 구간 정의 (공식 등급 기준)
     */
    const USER_TIER_CONFIG = [
        { name: 'bronze',   min: 0,    max: 1199, step: 240 }, // Newbie
        { name: 'silver',   min: 1200, max: 1399, step: 40  }, // Pupil
        { name: 'gold',     min: 1400, max: 1599, step: 40  }, // Specialist
        { name: 'platinum', min: 1600, max: 1899, step: 60  }, // Expert
        { name: 'diamond',  min: 1900, max: 2399, step: 100 }, // CM / Master / IM
        { name: 'ruby',     min: 2400, max: 2999, step: 120 }  // GM / IGM
    ];

    const getIconPath = (name, level) => `icons/${name}${level}.svg`;

    return {
        /**
         * [문제용] 800점(B5) 기준 100점 단위 선형 매핑
         * 800=B5, 900=B4 ... 1200=B1, 1300=S5 ... 3300=R5
         */
        getProblemTierIcon: function(rating) {
            if (!rating || rating === 'Unrated' || rating === '?') return 'icons/question_mark.svg';
            const r = parseInt(rating);
            if (isNaN(r)) return 'icons/question_mark.svg';
            if (r >= 3600) return getIconPath('ruby', 1); // 3500 초과 시 Ruby 1 고정
            if (r < 800) return getIconPath('bronze', 5);

            // 100점당 1단계 (Index 0 = 800점 = B5)
            const totalIndex = Math.floor((r - 800) / 100);
            const tierGroup = Math.floor(totalIndex / 5);
            const level = 5 - (totalIndex % 5);

            const tierName = TIER_NAMES[tierGroup] || 'ruby';
            return getIconPath(tierName, Math.max(1, Math.min(5, level)));
        },

        /**
         * [유저용] 공식 등급 구간에 따른 티어 아이콘 반환
         */
        getUserTierIcon: function(rating) {
            if (!rating || rating === 'Unrated' || rating === '?') return 'icons/no_rating.svg';
            const r = parseInt(rating);
            if (isNaN(r) || r < 0) return 'icons/no_rating.svg';
            if (r >= 3000) return 'icons/master.svg'; // Legendary Grandmaster

            for (const cfg of USER_TIER_CONFIG) {
                if (r >= cfg.min && r <= cfg.max) {
                    const level = 5 - Math.floor((r - cfg.min) / cfg.step);
                    return getIconPath(cfg.name, Math.max(1, Math.min(5, level)));
                }
            }
            return 'icons/bronze5.svg';
        },

        /**
         * [검색용] 티어 코드(예: s3, g1)를 Rating 범위로 변환 (문제 티어 기준 역산)
         */
        getRangeFromTierCode: function(tierCode) {
            const code = tierCode.toLowerCase();
            if (code === 'm') return { min: 3600, max: 9999 };
            
            const prefix = code.charAt(0);
            const level = parseInt(code.charAt(1));
            const groupIndex = ['b', 's', 'g', 'p', 'd', 'r'].indexOf(prefix);
            
            if (groupIndex === -1 || isNaN(level) || level < 1 || level > 5) return null;
            
            // 역산 로직: (Group * 5 + (5 - Level)) * 100 + 800
            const totalIndex = groupIndex * 5 + (5 - level);
            const rangeMin = totalIndex * 100 + 800;
            return { min: rangeMin, max: rangeMin + 99 };
        }
    };
})();