/**
 * src/core/queryParser.js
 * 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    
    // 개별 조건(Token) 평가 로직
    const evaluateToken = (token, rowData) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();
        
        // rowData 안의 전체 텍스트(소문자)에 해당 토큰이 포함되어 있는지 확인
        const match = rowData.fullText.includes(actualToken);
        
        return isNot ? !match : match;
    };

    return {
        // 활성화된 필터 배열을 받아 평가 함수(Evaluator)를 반환
        createEvaluator: (activeFilters) => {
            return function(rowData) {
                if (activeFilters.length === 0) return true; // 조건이 없으면 모두 통과
                
                // 모든 필터(AND 조건)를 만족해야 true 반환
                for (let i = 0; i < activeFilters.length; i++) {
                    if (!evaluateToken(activeFilters[i], rowData)) {
                        return false; 
                    }
                }
                return true;
            };
        }
    };
})();