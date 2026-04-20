/**
 * src/core/tierCalculator.js
 * 레이팅 -> 백준 티어 아이콘 경로 변환기
 */
window.BOJ_CF.TierCalculator = (function() {
    // 티어 그룹 배열 (인덱스 0: 브론즈 ~ 5: 루비)
    const tierNames = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby'];

    // [공통 헬퍼] 레이팅 숫자를 수학적으로 계산하여 아이콘 경로 반환
    const calculateIconPath = (rating, fallbackIcon) => {
        if (rating === undefined || rating === null || rating === 'Unrated' || rating === '?') return fallbackIcon;
        const r = parseInt(rating);
        if (isNaN(r) || r === 0) return fallbackIcon;

        // 100점 단위 버킷화 (800점 기준)
        let index = Math.floor(r / 100) - 8;
        
        // 하한 및 상한 캡(Cap) 적용 (유저 하드코딩 규칙 반영)
        if (index < 0) index = 0; // 900 미만은 모두 Bronze 5
        if (index > 27) index = 27; // 3500 이상은 모두 Ruby 3

        const tierGroup = Math.floor(index / 5); // 0(bronze) ~ 5(ruby)
        const subLevel = 5 - (index % 5);        // 5 ~ 1

        return `icons/${tierNames[tierGroup]}${subLevel}.svg`;
    };

    return {
        // [입력/검색용] "s3" 등의 문자열을 CF 레이팅 범위 {min, max}로 역산
        getRangeFromTierCode: function(tierCode) {
            if (tierCode === 'm') return { min: 3500, max: Infinity };

            const prefix = tierCode.charAt(0);
            const level = parseInt(tierCode.charAt(1)); // 1~5
            
            // prefix를 인덱스 번호로 매핑
            const groupIndex = ['b', 's', 'g', 'p', 'd', 'r'].indexOf(prefix);
            
            if (groupIndex === -1 || isNaN(level) || level < 1 || level > 5) return null;
            
            // 고유 인덱스 계산 (예: s3 -> group 1, level 3 -> 1*5 + 2 = 7)
            const totalIndex = groupIndex * 5 + (5 - level);
            
            // b5 (Total Index 0)는 0점부터 899점까지 폭넓게 포괄
            const rangeMin = totalIndex === 0 ? 0 : totalIndex * 100 + 800;
            const rangeMax = totalIndex * 100 + 899;
            
            return { min: rangeMin, max: rangeMax };
        },

        // [출력/렌더링용] 유저 프로필 아이콘 반환
        getUserTierIcon: function(rating) {
            return calculateIconPath(rating, 'icons/no_rating.svg');
        },

        // [출력/렌더링용] 문제 테이블 아이콘 반환
        getProblemTierIcon: function(rating) {
            return calculateIconPath(rating, 'icons/question_mark.svg');
        }
    };
})();