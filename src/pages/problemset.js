window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Problemset = (function() {
    let globalDB = [];

    // 정렬 미들웨어: 난이도 오름차순 (없는 문제는 맨 뒤로)
    const sortProblems = (problems) => {
        return problems.sort((a, b) => {
            const rA = a.rating || Infinity;
            const rB = b.rating || Infinity;
            if (rA !== rB) return rA - rB;
            return b.contestId - a.contestId; // 레이팅 같으면 최신 문제 순
        });
    };

    const buildVirtualTable = (problems) => {
        const tableHtml = `
            <table class="datatable boj-virtual-datatable" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr><th>문제</th><th>제목</th><th>맞힌 사람</th><th>난이도</th><th>✅</th></tr>
                </thead>
                <tbody>
                    ${problems.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:40px; color:#888;">검색 결과가 없습니다.</td></tr>` : ''}
                    ${sortProblems(problems).slice(0, window.BOJ_CF.Config.MAX_RENDER_COUNT).map(p => {
                        const icon = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(p.rating));
                        return `<tr>
                            <td><a href="/problemset/problem/${p.contestId}/${p.index}" style="color:var(--boj-primary); font-weight:bold;">${p.contestId}${p.index}</a></td>
                            <td><a href="/problemset/problem/${p.contestId}/${p.index}">${p.name}</a></td>
                            <td style="color:var(--boj-primary); font-weight:bold; font-size: 13px;"><img src="//codeforces.com/codeforces.org/s/87100/images/icons/user.png" style="vertical-align:-2px; width:12px; opacity:0.7;"> ${p.solvedCount.toLocaleString()}</td>
                            <td><img src="${icon}" class="boj-tier-icon" title="${p.rating || '?'}"></td>
                            <td>${p.isSolved ? '<span style="color:#009874; font-weight:bold;">✔</span>' : ''}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
        let vt = document.getElementById('boj-virtual-table');
        if (!vt) {
            vt = document.createElement('div'); vt.id = 'boj-virtual-table';
            document.querySelector('.boj-search-container').insertAdjacentElement('afterend', vt);
        }
        vt.innerHTML = tableHtml;
    };

    const handleFilters = (state) => {
        const originalTable = document.querySelector('.datatable');
        const pagination = document.querySelectorAll('.pagination');
        const vt = document.getElementById('boj-virtual-table');

        if (state.activeFilters.length === 0) {
            if (originalTable) originalTable.style.display = '';
            pagination.forEach(p => p.style.display = '');
            if (vt) vt.style.display = 'none';
        } else {
            if (originalTable) originalTable.style.display = 'none';
            pagination.forEach(p => p.style.display = 'none');
            const evaluator = window.BOJ_CF.QueryParser.createEvaluator(state.activeFilters);
            const filtered = globalDB.filter(evaluator);
            buildVirtualTable(filtered);
            if (vt) vt.style.display = 'block';
        }
    };

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // [추가됨] 페이지 진입 즉시 원본 테이블과 페이지네이션 영구 숨김
            const origTable = document.querySelector('.datatable');
            const paginations = document.querySelectorAll('.pagination');
            if (origTable) origTable.style.display = 'none';
            paginations.forEach(p => p.style.display = 'none');

            window.BOJ_CF.Components.SearchBar.init(pc);
            window.BOJ_CF.Components.PillContainer.init();

            const handleEl = document.querySelector('.boj-header-user'); // 변경된 헤더 클래스 참조
            const handle = handleEl ? handleEl.innerText.trim() : null;
            
            const [allProbs, userStatus] = await Promise.all([
                window.BOJ_CF.Fetcher.fetchAllProblems(),
                handle ? window.BOJ_CF.Fetcher.fetchUserStatus(handle) : Promise.resolve(null)
            ]);

            if (allProbs && allProbs.problems && allProbs.problemStatistics) {
                // [추가됨] solvedCount 매핑용 Dictionary(Zipping)
                const solvedCountMap = {};
                allProbs.problemStatistics.forEach(stat => {
                    solvedCountMap[`${stat.contestId}${stat.index}`] = stat.solvedCount;
                });

                const solvedSet = new Set();
                if (userStatus && userStatus.result) {
                    userStatus.result.forEach(sub => { if (sub.verdict === 'OK') solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`); });
                }
                
                globalDB = allProbs.problems.map(p => ({
                    id: `${p.contestId}${p.index}`,
                    name: p.name,
                    rating: p.rating,
                    tags: p.tags,
                    contestId: p.contestId,
                    index: p.index,
                    isSolved: solvedSet.has(`${p.contestId}${p.index}`),
                    solvedCount: solvedCountMap[`${p.contestId}${p.index}`] || 0 // [추가됨] 맞힌 사람 수 결합
                }));
            }

            // [추가됨] 필터 여부와 무관하게 초기 가상 테이블 강제 렌더링
            buildVirtualTable(globalDB);
            const vt = document.getElementById('boj-virtual-table');
            if (vt) vt.style.display = 'block';

            // 기존 이벤트 구독 유지 (단, handleFilters 내에서 원본 테이블 복구 로직은 삭제해도 무방함)
            window.BOJ_CF.StateManager.subscribe(handleFilters);
        }
    };
})();