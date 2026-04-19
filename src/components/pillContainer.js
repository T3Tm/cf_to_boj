/**
 * src/components/pillContainer.js
 * 알약 렌더링 및 이벤트 위임 삭제
 */
window.BOJ_CF.Components.PillContainer = (function() {
    let containerElement = null;

    const render = (state) => {
        if (!containerElement) return;
        containerElement.innerHTML = '';
        
        state.activeFilters.forEach(filter => {
            const pill = document.createElement('div');
            pill.className = 'boj-pill';
            pill.innerHTML = `<span>${filter}</span><button class="boj-pill-remove" data-val="${filter}">✕</button>`;
            containerElement.appendChild(pill);
        });
    };

    return {
        init: function() {
            const searchContainer = document.querySelector('.boj-search-container');
            if (!searchContainer || document.getElementById('boj-selected-pills')) return;
            
            containerElement = document.createElement('div');
            containerElement.id = 'boj-selected-pills';
            containerElement.className = 'boj-selected-pills';
            searchContainer.appendChild(containerElement);

            containerElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('boj-pill-remove')) {
                    window.BOJ_CF.StateManager.removeFilter(e.target.getAttribute('data-val'));
                }
            });

            window.BOJ_CF.StateManager.subscribe(render);
        }
    };
})();