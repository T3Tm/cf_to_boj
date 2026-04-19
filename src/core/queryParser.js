/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    const evaluateToken = (token, rowData) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();
        const match = rowData.fullText.includes(actualToken);
        return isNot ? !match : match;
    };

    return {
        createEvaluator: (activeFilters) => {
            return function(rowData) {
                if (activeFilters.length === 0) return true;
                for (let i = 0; i < activeFilters.length; i++) {
                    if (!evaluateToken(activeFilters[i], rowData)) return false; 
                }
                return true;
            };
        }
    };
})();