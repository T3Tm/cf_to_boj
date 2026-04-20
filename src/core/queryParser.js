/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    const matchTierOrRating = (query, ratingValue) => {
        const parts = query.split('..');
        
        const parseValue = (valStr) => {
            if (!valStr) return null;
            // 1. 만약 "s3" 같은 백준 티어 문자열이라면
            if (/[bsgpdr][1-5]|m/i.test(valStr)) {
                return window.BOJ_CF.TierCalculator.getRangeFromTierCode(valStr.toLowerCase());
            }
            // 2. 그냥 숫자 레이팅이라면
            const num = parseInt(valStr);
            return isNaN(num) ? null : { min: num, max: num };
        };

        let min = -Infinity, max = Infinity;
        
        if (parts.length === 1) { // r:s3 (단일)
            const range = parseValue(parts[0]);
            if (!range) return true; // 잘못된 값이면 통과 (오류 방지)
            return ratingValue >= range.min && ratingValue <= range.max;
        } else { // r:s5..g1 (범위)
            const range1 = parseValue(parts[0]);
            const range2 = parseValue(parts[1]);
            if (range1) min = range1.min;
            if (range2) max = range2.max;
            return ratingValue >= min && ratingValue <= max;
        }
    };

    const evaluateToken = (token, p) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();
        if (!actualToken) return true;

        if (actualToken === '@me') return isNot ? !p.isSolved : p.isSolved;
        if (actualToken === '?@me') return !p.isSolved;

        // [수정됨] 백준 티어 기반 레이팅 검색
        if (actualToken.startsWith('r:') || actualToken.startsWith('tier:') || actualToken.startsWith('rating:')) {
            const rangeQuery = actualToken.split(':')[1];
            return isNot ? !matchTierOrRating(rangeQuery, p.rating) : matchTierOrRating(rangeQuery, p.rating);
        }

        if (actualToken.startsWith('s:') || actualToken.startsWith('solved:')) {
            const parts = actualToken.split(':')[1].split('..');
            const min = parts[0] ? parseInt(parts[0]) : -Infinity;
            const max = parts[1] === "" ? Infinity : (parts[1] ? parseInt(parts[1]) : min);
            const isMatch = p.solvedCount >= min && p.solvedCount <= max;
            return isNot ? !isMatch : isMatch;
        }

        if (actualToken.startsWith('#') || actualToken.startsWith('tag:')) {
            const tag = (actualToken.startsWith('#') ? actualToken.substring(1) : actualToken.substring(4)).replace(/_/g, ' ');
            const match = p.tags.some(t => t.toLowerCase().includes(tag));
            return isNot ? !match : match;
        }

        if (actualToken.startsWith('id:')) return p.id.toLowerCase() === actualToken.substring(3);
        if (actualToken.startsWith('c:')) return String(p.contestId) === actualToken.substring(2);

        const match = p.name.toLowerCase().includes(actualToken) || 
                      p.tags.some(t => t.toLowerCase().includes(actualToken.replace(/_/g, ' ')));
        return isNot ? !match : match;
    };

    return {
        createEvaluator: (activeFilters) => (problem) => {
            if (activeFilters.length === 0) return true;
            return activeFilters.every(filterStr => {
                const orGroups = filterStr.split('|');
                return orGroups.some(group => {
                    const andTokens = group.trim().split(/\s+/).filter(Boolean);
                    return andTokens.every(token => evaluateToken(token, problem));
                });
            });
        }
    };
})();