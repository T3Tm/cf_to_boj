window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Problemset = (function() {
    let globalDB = [];

    const buildVirtualTable = (problems) => {
        const tableHtml = `
            <table class="datatable" style="width:100%; border-collapse:collapse;">
                <tbody>
                    <tr><th>#</th><th>Name</th><th>Rating</th></tr>
                    ${problems.length === 0 ? `<tr><td colspan="3" style="text-align:center; padding:30px;">검색 결과가 없습니다.</td></tr>` : ''}
                    ${problems.slice(0, 100).map(p => {
                        const icon = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(p.rating));
                        return `<tr>
                            <td><a href="/problemset/problem/${p.contestId}/${p.index}">${p.contestId}${p.index}</a></td>
                            <td><a href="/problemset/problem/${p.contestId}/${p.index}"><img src="${icon}" class="boj-tier-icon"> ${p.name}</a> ${p.isSolved ? '✅' : ''}</td>
                            <td><span class="ProblemRating" title="Difficulty">${p.rating || '?'}</span></td>
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

            // API 연동 (Global DB + Hydration)
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

            // 오리지널 테이블 티어 아이콘 주입
            document.querySelectorAll('.datatable table tr:not(:first-child)').forEach(row => {
                const idLink = row.querySelector('td:first-child a');
                const ratingSpan = row.querySelector('span[title="Difficulty"]');
                if (idLink && !idLink.querySelector('img')) {
                    const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(ratingSpan ? ratingSpan.innerText.trim() : '0'));
                    idLink.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon">` + idLink.innerHTML;
                }
            });

            window.BOJ_CF.StateManager.subscribe(handleFilters);
        }
    };
})();