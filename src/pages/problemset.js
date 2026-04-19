/**
 * src/pages/problemset.js
 * 문제 목록 페이지 컨트롤러 (인덱싱 및 필터링 실행)
 */
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};

window.BOJ_CF.Pages.Problemset = (function() {
    let indexedRows = []; // 메모리 인덱싱 저장소

    // 1. 테이블 행 인덱싱 (성능 최적화: DOM 읽기 최소화)
    const indexTableRows = () => {
        const rows = document.querySelectorAll('.datatable table tr:not(:first-child)');
        indexedRows = Array.from(rows).map(row => ({
            element: row,
            fullText: row.innerText.toLowerCase() // 검색용 텍스트 미리 추출
        }));
    };

    // 2. 필터 적용 (Batch Rendering)
    const applyFilters = (state) => {
        const evaluator = window.BOJ_CF.QueryParser.createEvaluator(state.activeFilters);
        const paginations = document.querySelectorAll('.pagination');
        let visibleCount = 0;

        // 필터 활성화 시 페이지네이션 숨김
        paginations.forEach(p => p.style.display = state.activeFilters.length > 0 ? 'none' : '');

        // 메모리 인덱스 기반 필터링 (화면 프리징 방지)
        indexedRows.forEach(item => {
            const isVisible = evaluator(item);
            item.element.style.display = isVisible ? 'table-row' : 'none';
            if (isVisible) visibleCount++;
        });

        // 결과 없음 처리
        handleEmptyState(visibleCount, state.activeFilters.length);
    };

    const handleEmptyState = (count, filterCount) => {
        const existing = document.querySelector('.boj-empty-state');
        if (existing) existing.remove();

        if (count === 0 && filterCount > 0) {
            const table = document.querySelector('.datatable table tbody') || document.querySelector('.datatable table');
            const row = document.createElement('tr');
            row.className = 'boj-empty-state';
            row.innerHTML = `<td colspan="5" style="text-align:center; padding:40px; color:#888;">검색 결과가 없습니다.</td>`;
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

            // UI 조립
            window.BOJ_CF.Components.SearchBar.init(pc);
            window.BOJ_CF.Components.PillContainer.init();
            
            indexTableRows();
            renderTiers();

            // 상태 구독: 필터 변경 시 화면 갱신
            window.BOJ_CF.StateManager.subscribe(applyFilters);

            // AJAX 감시: 표 내용 바뀌면 다시 인덱싱 및 렌더링
            window.BOJ_CF.DOMObserver.init('.datatable');
            window.BOJ_CF.DOMObserver.subscribe(() => {
                indexTableRows();
                renderTiers();
                applyFilters(window.BOJ_CF.StateManager.getState());
            });
        }
    };
})();