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
                    <tr><th>문제</th><th>제목</th><th>난이도</th><th>✅</th></tr>
                </thead>
                <tbody>
                    ${problems.length === 0 ? `<tr><td colspan="4" style="text-align:center; padding:30px;">검색 결과가 없습니다.</td></tr>` : ''}
                    ${sortProblems(problems).slice(0, window.BOJ_CF.Config.MAX_RENDER_COUNT).map(p => {
                        const icon = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(p.rating));
                        return `<tr>
                            <td><a href="/problemset/problem/${p.contestId}/${p.index}">${p.contestId}${p.index}</a></td>
                            <td><a href="/problemset/problem/${p.contestId}/${p.index}">${p.name}</a></td>
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
            window.BOJ_CF.Components.SearchBar.init(pc);
            window.BOJ_CF.Components.PillContainer.init();

            const handleEl = document.querySelector('.lang-chooser a[href^="/profile/"]');
            const handle = handleEl ? handleEl.innerText.trim() : null;
            
            const [allProbs, userStatus] = await Promise.all([
                window.BOJ_CF.Fetcher.fetchAllProblems(),
                handle ? window.BOJ_CF.Fetcher.fetchUserStatus(handle) : Promise.resolve(null)
            ]);

            if (allProbs && allProbs.problems) {
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
                    isSolved: solvedSet.has(`${p.contestId}${p.index}`)
                }));
            }

            // 오리지널 테이블 티어 아이콘 및 헤더 변경
            const origTable = document.querySelector('.datatable table');
            if (origTable) {
                const headRow = origTable.querySelector('tr:first-child');
                if(headRow) headRow.innerHTML = `<th>문제</th><th>제목</th><th><div title="Difficulty" style="cursor:help;">난이도</div></th><th>✅</th>`;
                origTable.querySelectorAll('tr:not(:first-child)').forEach(row => {
                    const idLink = row.querySelector('td:first-child a');
                    const ratingSpan = row.querySelector('span[title="Difficulty"]');
                    const nameCell = row.querySelector('td:nth-child(2)');
                    if (idLink && nameCell) {
                        const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(ratingSpan ? ratingSpan.innerText.trim() : '0'));
                        // 아이콘을 번호 대신 이름 옆에 배치
                        if(!nameCell.querySelector('img')) nameCell.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon"> ` + nameCell.innerHTML;
                    }
                });
            }

            window.BOJ_CF.StateManager.subscribe(handleFilters);
        }
    };
})();