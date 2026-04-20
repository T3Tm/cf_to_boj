/**
 * src/core/tierCalculator.js (v3.2.4)
 * 레이팅 -> 백준 티어 아이콘 경로 변환기 (공식 등급 기반 유저 티어 & 800점 기준 문제 티어)
 */
window.BOJ_CF.TierCalculator = (function() {
    const tierNames = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby'];

    // [유저용] 공식 등급 기반 설정
    const userConfig = [
        { name: 'bronze',   min: 0,    max: 1199, step: 240 }, // Newbie
        { name: 'silver',   min: 1200, max: 1399, step: 40  }, // Pupil
        { name: 'gold',     min: 1400, max: 1599, step: 40  }, // Specialist
        { name: 'platinum', min: 1600, max: 1899, step: 60  }, // Expert
        { name: 'diamond',  min: 1900, max: 2099, step: 40  }, // Candidate Master
        { name: 'ruby',     min: 2100, max: 2999, step: 180 }  // Master ~ IGM
    ];

    const getTierIconPath = (name, level) => `icons/${name}${level}.svg`;

    return {
        // [입력/검색용] 문제 티어 기준 역산 (b5 -> 800)
        getRangeFromTierCode: function(tierCode) {
            const code = tierCode.toLowerCase();
            if (code === 'm') return { min: 3000, max: Infinity };
            
            const prefix = code.charAt(0);
            const level = parseInt(code.charAt(1));
            const groupIndex = ['b', 's', 'g', 'p', 'd', 'r'].indexOf(prefix);
            
            if (groupIndex === -1 || isNaN(level) || level < 1 || level > 5) return null;
            
            // 문제 로직 역산: index * 100 + 800
            const totalIndex = groupIndex * 5 + (5 - level);
            const rangeMin = totalIndex * 100 + 800;
            return { min: rangeMin, max: rangeMin + 99 };
        },

        // [유저용] 공식 등급(Newbie, Pupil 등) 구간별 매핑
        getUserTierIcon: function(rating) {
            if (rating === undefined || rating === null || rating === 'Unrated' || rating === '?') {
                return 'icons/question_mark.svg';
            }
            const r = parseInt(rating);
            if (isNaN(r) || r < 0) return 'icons/question_mark.svg';
            if (r >= 3000) return 'icons/master.svg'; // Legendary Grandmaster

            for (const cfg of userConfig) {
                if (r >= cfg.min && r <= cfg.max) {
                    const subLevel = 5 - Math.min(4, Math.floor((r - cfg.min) / cfg.step));
                    return getTierIconPath(cfg.name, subLevel);
                }
            }
            return 'icons/bronze5.svg';
        },

        // [문제용] 800점(B5) 기준 100점 단위 선형 매핑
        getProblemTierIcon: function(rating) {
            if (rating === undefined || rating === null || rating === 'Unrated' || rating === '?') {
                return 'icons/question_mark.svg';
            }
            const r = parseInt(rating);
            if (isNaN(r)) return 'icons/question_mark.svg';

            // 800점 = B5(Index 0), 100점당 1단계
            const index = Math.max(0, Math.floor((r - 800) / 100));
            const group = Math.floor(index / 5);
            const level = 5 - (index % 5);

            if (group >= tierNames.length) return getTierIconPath('ruby', 1);
            return getTierIconPath(tierNames[group], level);
        }
    };
})();