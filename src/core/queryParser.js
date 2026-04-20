/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    const matchRange = (query, value) => {
        const parts = query.split('..');
        const minVal = parseInt(parts[0]);
        const maxVal = parseInt(parts[1]);
        const min = isNaN(minVal) ? -Infinity : minVal;
        const max = parts[1] === undefined ? min : (isNaN(maxVal) ? Infinity : maxVal);
        return value >= min && value <= max;
    };

    const evaluateToken = (token, p) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();
        if (!actualToken) return true;

        if (actualToken === '@me') return isNot ? !p.isSolved : p.isSolved;
        if (actualToken === '?@me') return !p.isSolved;

        if (actualToken.startsWith('r:') || actualToken.startsWith('rating:')) {
            const rangeQuery = actualToken.split(':')[1];
            return isNot ? !matchRange(rangeQuery, p.rating) : matchRange(rangeQuery, p.rating);
        }

        if (actualToken.startsWith('s:') || actualToken.startsWith('solved:')) {
            const rangeQuery = actualToken.split(':')[1];
            return isNot ? !matchRange(rangeQuery, p.solvedCount) : matchRange(rangeQuery, p.solvedCount);
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