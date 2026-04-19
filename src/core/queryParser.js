/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    const evaluateToken = (token, problemData) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();

        if (actualToken === '@me') return isNot ? !problemData.isSolved : problemData.isSolved;
        
        if (actualToken.startsWith('tag:')) {
            const tag = actualToken.substring(4);
            const match = problemData.tags.some(t => t.toLowerCase().includes(tag));
            return isNot ? !match : match;
        }
        
        if (actualToken.startsWith('*')) {
            const rating = parseInt(actualToken.substring(1));
            const match = problemData.rating === rating;
            return isNot ? !match : match;
        }

        const match = problemData.name.toLowerCase().includes(actualToken) || 
                      problemData.id.toLowerCase().includes(actualToken);
        return isNot ? !match : match;
    };

    return {
        createEvaluator: (activeFilters) => {
            return function(problemData) {
                if (activeFilters.length === 0) return true;
                for (let i = 0; i < activeFilters.length; i++) {
                    if (!evaluateToken(activeFilters[i], problemData)) return false; 
                }
                return true;
            };
        }
    };
})();