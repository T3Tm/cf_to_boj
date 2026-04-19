/**
 * src/pages/problemset.js
 * 문제 목록 페이지 컨트롤러 (인메모리 필터링 및 렌더링 전담)
 */
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};

window.BOJ_CF.Pages.Problemset = (function() {
    let indexedRows = []; 

    // DOM 읽기 최소화를 위한 인메모리 인덱싱
    const indexTableRows = () => {
        const rows = document.querySelectorAll('.datatable table tr:not(:first-child)');
        indexedRows = Array.from(rows).map(row => ({
            element: row,
            fullText: row.innerText.toLowerCase()
        }));
    };

    // 상태 변경 시 배치 렌더링 (Batch Rendering)
    const applyFilters = (state) => {
        const evaluator = window.BOJ_CF.QueryParser.createEvaluator(state.activeFilters);
        const paginations = document.querySelectorAll('.pagination');
        let visibleCount = 0;

        paginations.forEach(p => p.style.display = state.activeFilters.length > 0 ? 'none' : '');

        indexedRows.forEach(item => {
            if (item.element.classList.contains('boj-empty-state')) return;
            const isVisible = evaluator(item);
            item.element.style.display = isVisible ? 'table-row' : 'none';
            if (isVisible) visibleCount++;
        });

        handleEmptyState(visibleCount, state.activeFilters.length);
    };

    const handleEmptyState = (count, filterCount) => {
        const existing = document.querySelector('.boj-empty-state');
        if (existing) existing.remove();

        if (count === 0 && filterCount > 0) {
            const table = document.querySelector('.datatable table tbody') || document.querySelector('.datatable table');
            const row = document.createElement('tr');
            row.className = 'boj-empty-state';
            row.innerHTML = `<td colspan="5" style="text-align:center; padding:40px; color:#888; font-weight:bold;">검색 조건과 일치하는 문제가 없습니다.</td>`;
            table.appendChild(row);
        }
    };

    const renderTiers = () => {
        indexedRows.forEach(item => {
            const idLink = item.element.querySelector('td:first-child a');
            const ratingSpan = item.element.querySelector('td:nth-child(4) span');
            if (idLink && !idLink.querySelector('img')) {
                const rating = ratingSpan ? ratingSpan.innerText.trim() : '';
                const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(rating));
                idLink.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon">` + idLink.innerHTML;
            }
        });
    };

    return {
        init: function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // UI 컴포넌트 마운트
            window.BOJ_CF.Components.SearchBar.init(pc);
            window.BOJ_CF.Components.PillContainer.init();
            
            indexTableRows();
            renderTiers();

            // 상태 구독
            window.BOJ_CF.StateManager.subscribe(applyFilters);

            // AJAX 통신으로 표가 갱신되면 자동 복구
            window.BOJ_CF.DOMObserver.init('.datatable');
            window.BOJ_CF.DOMObserver.subscribe(() => {
                indexTableRows();
                renderTiers();
                applyFilters(window.BOJ_CF.StateManager.getState());
            });
        }
    };
})();