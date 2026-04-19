window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Problemset = (function() {
    let indexedRows = []; 

    const indexTableRows = (solvedSet = new Set()) => {
        const rows = document.querySelectorAll('.datatable table tr:not(:first-child)');
        indexedRows = Array.from(rows).map(row => {
            if (row.classList.contains('boj-empty-state')) return null;
            
            const idLink = row.querySelector('td:first-child a');
            const probId = idLink ? idLink.innerText.trim() : '';
            const ratingSpan = row.querySelector('td:nth-child(4) span');
            const tags = Array.from(row.querySelectorAll('a[title="Topic"]')).map(a => a.innerText.toLowerCase());

            return {
                element: row,
                fullText: row.innerText.toLowerCase(),
                id: probId,
                rating: ratingSpan ? ratingSpan.innerText.trim() : '0',
                tags: tags,
                isSolved: solvedSet.has(probId) // 하이드레이션: 풀이 여부 저장
            };
        }).filter(Boolean);
    };

    const applyFilters = (state) => {
        const evaluator = window.BOJ_CF.QueryParser.createEvaluator(state.activeFilters);
        const paginations = document.querySelectorAll('.pagination');
        let visibleCount = 0;

        paginations.forEach(p => p.style.display = state.activeFilters.length > 0 ? 'none' : '');

        indexedRows.forEach(item => {
            const isVisible = evaluator(item);
            item.element.style.display = isVisible ? 'table-row' : 'none';
            if (isVisible) visibleCount++;
        });
    };

    const renderTiers = () => {
        indexedRows.forEach(item => {
            const idLink = item.element.querySelector('td:first-child a');
            if (idLink && !idLink.querySelector('img')) {
                const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(item.rating));
                idLink.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon">` + idLink.innerHTML;
            }
        });
    };

    return {
        init: function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            window.BOJ_CF.Components.SearchBar.init(pc);
            window.BOJ_CF.Components.PillContainer.init();
            
            // 1차 렌더링 (텍스트 기반)
            indexTableRows();
            renderTiers();
            window.BOJ_CF.StateManager.subscribe(applyFilters);

            // 2차 하이드레이션 (API 기반 풀이 여부 결합)
            const handleElement = document.querySelector('.lang-chooser a[href^="/profile/"]');
            if (handleElement) {
                const handle = handleElement.innerText.trim();
                window.BOJ_CF.Fetcher.fetchUserStatus(handle).then(data => {
                    if (data && data.result) {
                        const solvedSet = new Set();
                        data.result.forEach(sub => {
                            if (sub.verdict === 'OK') solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
                        });
                        indexTableRows(solvedSet); // 풀이 데이터와 함께 재인덱싱
                        applyFilters(window.BOJ_CF.StateManager.getState());
                    }
                });
            }

            window.BOJ_CF.DOMObserver.init('.datatable');
            window.BOJ_CF.DOMObserver.subscribe(() => {
                indexTableRows();
                renderTiers();
                applyFilters(window.BOJ_CF.StateManager.getState());
            });
        }
    };
})();