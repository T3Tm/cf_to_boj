/**
 * src/components/pillContainer.js
 * 알약 렌더링 및 이벤트 위임 삭제
 */
window.BOJ_CF.Components.PillContainer = (function() {
    let initialized = false;
    const render = (state) => {
        const container = document.getElementById('boj-selected-pills');
        if (!container) return;
        container.innerHTML = state.activeFilters.map(f => `
            <div class="boj-pill">
                <span>${f}</span>
                <button class="boj-pill-remove" data-val="${f}">✕</button>
            </div>
        `).join('');
    };
    return {
        init: function() {
            const sb = document.querySelector('.boj-search-container');
            if (!sb || document.getElementById('boj-selected-pills')) return;
            const box = document.createElement('div');
            box.id = 'boj-selected-pills';
            box.className = 'boj-selected-pills';
            sb.appendChild(box);
            if (!initialized) {
                document.body.addEventListener('click', (e) => {
                    const rb = e.target.closest('.boj-pill-remove');
                    if (rb) window.BOJ_CF.StateManager.removeFilter(rb.getAttribute('data-val'));
                });
                window.BOJ_CF.StateManager.subscribe(render);
                initialized = true;
            }
        }
    };
})();