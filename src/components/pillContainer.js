/**
 * src/components/pillContainer.js
 * 알약 렌더링 및 이벤트 위임 삭제
 */
window.BOJ_CF.Components.PillContainer = (function() {
    let initialized = false;

    const render = (state) => {
        // [방어] 변수 참조 대신 실시간 쿼리로 DOM 꼬임 방지
        const container = document.getElementById('boj-selected-pills');
        if (!container) return; 
        
        container.innerHTML = ''; 
        state.activeFilters.forEach(filter => {
            const pill = document.createElement('div');
            pill.className = 'boj-pill';
            pill.innerHTML = `<span>${filter}</span><button class="boj-pill-remove" data-val="${filter}">✕</button>`;
            container.appendChild(pill);
        });
    };

    return {
        init: function() {
            const searchContainer = document.querySelector('.boj-search-container');
            if (!searchContainer || document.getElementById('boj-selected-pills')) return;

            const container = document.createElement('div');
            container.id = 'boj-selected-pills';
            container.className = 'boj-selected-pills';
            searchContainer.appendChild(container);

            if (!initialized) {
                // [방어] 전역 이벤트 위임 (삭제 버튼)
                document.body.addEventListener('click', (e) => {
                    if (e.target && e.target.classList.contains('boj-pill-remove')) {
                        window.BOJ_CF.StateManager.removeFilter(e.target.getAttribute('data-val'));
                    }
                });
                window.BOJ_CF.StateManager.subscribe(render);
                initialized = true;
            }
        }
    };
})();