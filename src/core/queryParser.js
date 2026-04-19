/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    const evaluateToken = (token, rowData) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();

        // 1. 내가 푼 문제 판별 (@me)
        if (actualToken === '@me') return isNot ? !rowData.isSolved : rowData.isSolved;

        // 2. 태그 매칭 (tag:dp)
        if (actualToken.startsWith('tag:')) {
            const tag = actualToken.substring(4);
            const match = rowData.tags.some(t => t.includes(tag));
            return isNot ? !match : match;
        }

        // 3. 레이팅 매칭 (*1500)
        if (actualToken.startsWith('*')) {
            const rating = actualToken.substring(1);
            const match = rowData.rating === rating;
            return isNot ? !match : match;
        }

        // 4. 기본 전체 텍스트 검색
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