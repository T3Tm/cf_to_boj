/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    // 숫자 범위 파싱 유틸리티 (예: "1500..2000", "..1200", "3000..")
    const matchRange = (query, value) => {
        const parts = query.split('..');
        const min = parts[0] === "" ? -Infinity : parseInt(parts[0]);
        const max = parts[1] === undefined ? min : (parts[1] === "" ? Infinity : parseInt(parts[1]));
        return value >= min && value <= max;
    };

    const evaluateToken = (token, p) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();

        // 1. 해결 여부
        if (actualToken === '@me') return isNot ? !p.isSolved : p.isSolved;
        if (actualToken === '?@me') return !p.isSolved;

        // 2. 레이팅 범위 (r:1500..2000)
        if (actualToken.startsWith('r:') || actualToken.startsWith('rating:')) {
            const rangeQuery = actualToken.split(':')[1];
            return isNot ? !matchRange(rangeQuery, p.rating) : matchRange(rangeQuery, p.rating);
        }

        // 3. 정답자 수 범위 (s:1000..)
        if (actualToken.startsWith('s:') || actualToken.startsWith('solved:')) {
            const rangeQuery = actualToken.split(':')[1];
            return isNot ? !matchRange(rangeQuery, p.solvedCount) : matchRange(rangeQuery, p.solvedCount);
        }

        // 4. 태그 (언더바를 공백으로 치환)
        if (actualToken.startsWith('#') || actualToken.startsWith('tag:')) {
            const tag = (actualToken.startsWith('#') ? actualToken.substring(1) : actualToken.substring(4)).replace(/_/g, ' ');
            const match = p.tags.some(t => t.toLowerCase().includes(tag));
            return isNot ? !match : match;
        }

        // 5. 문제 번호/대회
        if (actualToken.startsWith('id:')) return p.id.toLowerCase() === actualToken.substring(3);
        if (actualToken.startsWith('c:')) return String(p.contestId) === actualToken.substring(2);

        // 6. 텍스트 검색
        const match = p.name.toLowerCase().includes(actualToken);
        return isNot ? !match : match;
    };

    return {
        createEvaluator: (activeFilters) => {
            return function(problemData) {
                if (activeFilters.length === 0) return true;
                
                // [수정] OR(|) 조건 중 하나라도 만족하고, 그 내부의 AND(공백) 조건은 모두 만족하는가?
                return activeFilters.some(filterStr => {
                    const orGroups = filterStr.split('|');
                    return orGroups.some(group => {
                        const andTokens = group.trim().split(/\s+/);
                        return andTokens.every(token => evaluateToken(token, problemData));
                    });
                });
            };
        }
    };
})();