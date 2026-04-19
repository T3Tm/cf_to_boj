/**
 * src/components/pillContainer.js
 * 알약(Pill) 렌더링 및 이벤트 위임(Event Delegation) 기반 삭제 처리
 */
window.BOJ_CF.Components.PillContainer = (function() {
    let containerElement = null;

    // 상태가 변할 때마다 호출되는 렌더링 함수
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

            // [메모리 누수 방지] 컨테이너에 단 1개의 이벤트만 걸어 하위 삭제 버튼 모두 제어
            containerElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('boj-pill-remove')) {
                    const val = e.target.getAttribute('data-val');
                    window.BOJ_CF.StateManager.removeFilter(val);
                }
            });

            // 상태 관리자 구독
            window.BOJ_CF.StateManager.subscribe(render);
        }
    };
})();