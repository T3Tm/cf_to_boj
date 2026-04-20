/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    const matchRange = (query, value) => {
        const parts = query.split('..');
        const minVal = parseInt(parts[0]);
        const maxVal = parseInt(parts[1]);
        const min = isNaN(minVal) ? -Infinity : minVal; // NaN 방어
        const max = parts[1] === undefined ? min : (isNaN(maxVal) ? Infinity : maxVal);
        return value >= min && value <= max;
    };

    const evaluateToken = (token, p) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();
        if (!actualToken) return true; // 빈 토큰 통과

        if (actualToken === '@me') return isNot ? !p.isSolved : p.isSolved;
        if (actualToken.startsWith('r:') || actualToken.startsWith('rating:')) {
            return isNot ? !matchRange(actualToken.split(':')[1], p.rating) : matchRange(actualToken.split(':')[1], p.rating);
        }
        if (actualToken.startsWith('s:') || actualToken.startsWith('solved:')) {
            return isNot ? !matchRange(actualToken.split(':')[1], p.solvedCount) : matchRange(actualToken.split(':')[1], p.solvedCount);
        }
        if (actualToken.startsWith('#') || actualToken.startsWith('tag:')) {
            const tag = (actualToken.startsWith('#') ? actualToken.substring(1) : actualToken.substring(4)).replace(/_/g, ' ');
            const match = p.tags.some(t => t.toLowerCase().includes(tag));
            return isNot ? !match : match;
        }
        const match = p.name.toLowerCase().includes(actualToken) || 
                      p.tags.some(t => t.toLowerCase().includes(actualToken.replace(/_/g, ' ')));
        return isNot ? !match : match;
    };

    return {
        createEvaluator: (activeFilters) => (p) => {
            if (activeFilters.length === 0) return true;
            return activeFilters.some(f => f.split('|').some(g => g.trim().split(/\s+/).filter(Boolean).every(t => evaluateToken(t, p))));
        }
    };
})();