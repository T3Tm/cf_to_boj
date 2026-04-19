/**
 * src/core/queryParser.js
 * 복합 검색 쿼리 평가(Evaluator) 엔진
 */
window.BOJ_CF.QueryParser = (function() {
    // 숫자 범위 파싱 유틸리티 (예: "1500..2000", "..1200", "3000..")
    const matchRange = (query, value) => {
        const [minStr, maxStr] = query.split('..');
        const min = minStr === "" ? -Infinity : parseInt(minStr);
        const max = maxStr === undefined ? min : (maxStr === "" ? Infinity : parseInt(maxStr));
        return value >= min && value <= max;
    };

    const evaluateToken = (token, p) => {
        const isNot = token.startsWith('~') || token.startsWith('!');
        const actualToken = isNot ? token.substring(1).toLowerCase() : token.toLowerCase();

        // 1. 해결 여부 (@me, ~@me, ?@me)
        if (actualToken === '@me') return isNot ? !p.isSolved : p.isSolved;
        if (actualToken === '?@me') return !p.isSolved; // 시도했으나 못푼 문제는 별도 로직 필요 (현재는 미해결로 처리)

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

        // 4. 태그 (#dp, tag:dp)
        if (actualToken.startsWith('#') || actualToken.startsWith('tag:')) {
            const tag = (actualToken.startsWith('#') ? actualToken.substring(1) : actualToken.substring(4)).replace(/_/g, ' ');
            const match = p.tags.some(t => t.toLowerCase().includes(tag));
            return isNot ? !match : match;
        }

        // 5. 문제 번호/대회/인덱스 (id:2210B, c:2210, i:B)
        if (actualToken.startsWith('id:')) return p.id.toLowerCase() === actualToken.substring(3);
        if (actualToken.startsWith('c:')) return String(p.contestId) === actualToken.substring(2);
        if (actualToken.startsWith('i:')) return p.index.toLowerCase() === actualToken.substring(2);

        // 6. 기본 제목 검색
        return isNot ? !p.name.toLowerCase().includes(actualToken) : p.name.toLowerCase().includes(actualToken);
    };

    return {
        createEvaluator: (activeFilters) => {
            return function(problemData) {
                if (activeFilters.length === 0) return true;
                // [고도화] OR(|) 배열 중 하나라도 만족 AND 그 안의 AND(공백) 조건은 모두 만족
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