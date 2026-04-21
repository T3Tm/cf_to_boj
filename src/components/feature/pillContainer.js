/**
 * src/components/feature/pillContainer.js (v4.0.0)
 * [Atomic Design] 기능성 컴포넌트 - 선택된 필터(알약) 컨테이너
 */
window.BOJ_CF.Components.PillContainer = (function() {
    let container = null;

    /**
     * 상태 변경에 따라 알약 목록을 다시 렌더링합니다.
     */
    const render = (state) => {
        if (!container) return;
        
        container.innerHTML = state.activeFilters.map(f => `
            <div class="boj-pill">
                <span class="boj-pill-text">${f}</span>
                <button class="boj-pill-remove" data-val="${f}" title="삭제">✕</button>
            </div>
        `).join('');
    };

    return {
        /**
         * 알약 컨테이너를 초기화하고 상태 구독을 시작합니다.
         */
        init: function(rootElement) {
            if (!rootElement || document.getElementById('boj-selected-pills')) return;

            container = document.createElement('div');
            container.id = 'boj-selected-pills';
            container.className = 'boj-selected-pills';
            rootElement.appendChild(container);

            this.bindEvents();
            
            // 상태 구독 시작
            if (window.BOJ_CF.StateManager) {
                window.BOJ_CF.StateManager.subscribe(render);
                // 초기 상태 반영
                render(window.BOJ_CF.StateManager.getState());
            }

            console.log("[BOJ_CF] PillContainer initialized.");
        },

        /**
         * 삭제 버튼 클릭 이벤트를 바인딩합니다 (이벤트 위임).
         */
        bindEvents: function() {
            if (!container) return;

            container.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.boj-pill-remove');
                if (removeBtn && window.BOJ_CF.StateManager) {
                    const filterValue = removeBtn.getAttribute('data-val');
                    window.BOJ_CF.StateManager.removeFilter(filterValue);
                }
            });
        }
    };
})();