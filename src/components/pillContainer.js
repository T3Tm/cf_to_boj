/**
 * src/components/pillContainer.js
 * 알약 렌더링 및 이벤트 위임 삭제
 */
window.BOJ_CF.Components.PillContainer = (function() {
    let container = null;
    const render = (state) => {
        // [수정된 부분] 컨테이너가 변수에만 있고 실제 DOM에서는 유실되었는지 이중 확인
        if (!containerElement || !document.getElementById('boj-selected-pills')) return;
        
        containerElement.innerHTML = ''; // 기존 알약 지우기
        
        state.activeFilters.forEach(filter => {
            const pill = document.createElement('div');
            pill.className = 'boj-pill';
            // 이벤트 위임을 위해 클래스와 data-val 속성 부여
            pill.innerHTML = `<span>${filter}</span><button class="boj-pill-remove" data-val="${filter}">✕</button>`;
            containerElement.appendChild(pill);
        });
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