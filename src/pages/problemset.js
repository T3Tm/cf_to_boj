window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Problemset = (function() {
    let globalDB = [];
    let currentPage = 1;
    let sortMode = 'rating'; 
    let sortAsc = true;      

    const sortProblems = (problems) => {
        return [...problems].sort((a, b) => {
            if (sortMode === 'solvedCount') {
                return sortAsc ? a.solvedCount - b.solvedCount : b.solvedCount - a.solvedCount;
            } else {
                const rA = a.rating || Infinity;
                const rB = b.rating || Infinity;
                if (rA !== rB) return sortAsc ? rA - rB : rB - rA;
                return b.contestId - a.contestId; 
            }
        });
    };

    const buildVirtualTable = (problems) => {
        const max = window.BOJ_CF.Config.MAX_RENDER_COUNT; 
        const totalPages = Math.ceil(problems.length / max) || 1;
        const startIndex = (currentPage - 1) * max;
        const currentProblems = sortProblems(problems).slice(startIndex, startIndex + max);

        let paginationHtml = `<div class="boj-pagination" style="text-align:center; margin-top:20px; padding-bottom:20px;">`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 4 && i <= currentPage + 4)) {
                paginationHtml += `<button class="boj-page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 5 || i === currentPage + 5) {
                paginationHtml += `<span style="margin:0 3px; color:var(--boj-text);">...</span>`;
            }
        }
        paginationHtml += `</div>`;

        const tableHtml = `
            <table class="datatable boj-virtual-datatable" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="width: 10%;">문제</th>
                        <th>제목</th>
                        <th style="width: 15%;" data-sort="solvedCount" class="boj-sortable">맞힌 사람 ↕</th>
                        <th style="width: 10%;" data-sort="rating" class="boj-sortable">난이도 ↕</th>
                        <th style="width: 5%;">✅</th>
                    </tr>
                </thead>
                <tbody>
                    ${problems.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:40px; color:#888;">검색 결과가 없습니다.</td></tr>` : ''}
                    ${currentProblems.map(p => {
                        const icon = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(p.rating));
                        return `<tr>
                            <td style="text-align: center;"><a href="/problemset/problem/${p.contestId}/${p.index}" style="color:var(--boj-primary); font-weight:bold;">${p.contestId}${p.index}</a></td>
                            <td><a href="/problemset/problem/${p.contestId}/${p.index}">${p.name}</a></td>
                            <td style="text-align: center; color:var(--boj-primary); font-weight:bold; font-size: 13px;">
                                <img src="//codeforces.com/codeforces.org/s/87100/images/icons/user.png" style="vertical-align:-2px; width:12px; opacity:0.7; margin-right: 4px;"> 
                                ${p.solvedCount.toLocaleString()}
                            </td>
                            <td style="text-align: center;">
                                <img src="${icon}" class="boj-tier-icon" title="${p.rating || '?'}" style="width: 18px; vertical-align: middle;">
                            </td>
                            <td style="text-align: center;">${p.isSolved ? '<span style="color:#009874; font-weight:bold;">✔</span>' : ''}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
            ${problems.length > max ? paginationHtml : ''}
        `;

        let vt = document.getElementById('boj-virtual-table');
        if (!vt) {
            vt = document.createElement('div'); vt.id = 'boj-virtual-table';
            document.querySelector('.boj-search-container').insertAdjacentElement('afterend', vt);
            
            // 코드포스 원본 테이블 즉시 숨김 처리 (안전장치)
            const originalTables = document.querySelectorAll('.datatable:not(.boj-virtual-datatable)');
            originalTables.forEach(t => t.style.display = 'none');
            
            vt.addEventListener('click', (e) => {
                const btn = e.target.closest('.boj-page-btn');
                if (btn) {
                    currentPage = parseInt(btn.getAttribute('data-page'));
                    // 현재 필터 상태를 다시 읽어와서 정렬 및 렌더링
                    handleFilters(window.BOJ_CF.StateManager.getState());
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                const th = e.target.closest('th[data-sort]');
                if (th) {
                    const type = th.getAttribute('data-sort');
                    if (sortMode === type) sortAsc = !sortAsc;
                    else {
                        sortMode = type;
                        sortAsc = type === 'rating'; 
                    }
                    currentPage = 1;
                    // 현재 필터 상태를 다시 읽어와서 정렬 및 렌더링
                    handleFilters(window.BOJ_CF.StateManager.getState());
                }
            });
        }
        vt.innerHTML = tableHtml;
    };

    const handleFilters = (state) => {
        // [중요] currentPage 초기화 로직은 StateManager의 필터가 추가될 때만 작동해야 하므로, 
        // 정렬 시에는 초기화하지 않도록 buildVirtualTable 내부에서 currentPage를 조절함
        const evaluator = window.BOJ_CF.QueryParser.createEvaluator(state.activeFilters);
        const filtered = globalDB.filter(evaluator);
        buildVirtualTable(filtered);
    };

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // 1. Settings 반영 (저장된 페이지 크기 로드)
            if (window.BOJ_CF.Settings) {
                window.BOJ_CF.Config.MAX_RENDER_COUNT = window.BOJ_CF.Settings.get('MAX_RENDER_COUNT') || 20;
            }

            // 2. 컴포넌트 렌더링
            window.BOJ_CF.Components.SearchBar.render(pc);

            // 3. API 로드 및 DB 구축
            const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
            const handle = document.querySelector('.boj-header-user')?.innerText.trim();
            const userStatus = (handle && handle !== 'Guest') ? await window.BOJ_CF.Fetcher.fetchUserStatus(handle) : null;

            if (allProbs) {
                const solvedCountMap = {};
                allProbs.problemStatistics.forEach(stat => {
                    solvedCountMap[`${stat.contestId}${stat.index}`] = stat.solvedCount;
                });

                const solvedSet = new Set();
                if (userStatus && userStatus.result) {
                    userStatus.result.forEach(sub => { 
                        if (sub.verdict === 'OK') solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`); 
                    });
                }
                
                globalDB = allProbs.problems.map(p => ({
                    id: `${p.contestId}${p.index}`,
                    name: p.name,
                    rating: p.rating,
                    tags: p.tags,
                    contestId: p.contestId,
                    index: p.index,
                    isSolved: solvedSet.has(`${p.contestId}${p.index}`),
                    solvedCount: solvedCountMap[`${p.contestId}${p.index}`] || 0
                }));

                window.BOJ_CF.StateManager.subscribe(handleFilters);
                handleFilters(window.BOJ_CF.StateManager.getState());
            }
        }
    };
})();