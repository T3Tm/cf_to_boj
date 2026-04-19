/**
 * src/components/pillContainer.js
 * 알약 렌더링 및 이벤트 위임 삭제
 */
window.BOJ_CF.Components.PillContainer = (function() {
    let container = null;
    const render = (state) => {
        if (!container) return;
        container.innerHTML = state.activeFilters.map(f => `<div class="boj-pill"><span>${f}</span><button class="boj-pill-remove" data-val="${f}">✕</button></div>`).join('');
    };
    return {
        init: function() {
            const searchContainer = document.querySelector('.boj-search-container');
            if (!searchContainer || document.getElementById('boj-selected-pills')) return;
            container = document.createElement('div');
            container.id = 'boj-selected-pills'; container.className = 'boj-selected-pills';
            searchContainer.appendChild(container);
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('boj-pill-remove')) window.BOJ_CF.StateManager.removeFilter(e.target.getAttribute('data-val'));
            });
            window.BOJ_CF.StateManager.subscribe(render);
        }
    };
})();