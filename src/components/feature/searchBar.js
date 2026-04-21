/**
 * src/components/feature/searchBar.js (v4.0.0)
 * [Atomic Design] 기능성 컴포넌트 - 통합 검색창
 */
window.BOJ_CF.Components.SearchBar = (function() {
    return {
        /**
         * 검색창을 렌더링하고 이벤트를 바인딩합니다.
         */
        render: function(containerElement) {
            if (!containerElement || document.querySelector('.boj-search-container')) return;

            const searchUI = document.createElement('div');
            searchUI.className = 'boj-search-container';
            searchUI.innerHTML = `
                <div class="boj-search-input-wrapper">
                    <i class="boj-search-icon">🔍</i>
                    <input type="text" id="boj-search-input" autocomplete="off" 
                        placeholder="예: #dp *s1..g5 @me (solved.ac 문법 지원)">
                    <button id="boj-search-btn">검색</button>
                </div>
                <div id="boj-pill-container-root"></div>
            `;
            
            containerElement.insertBefore(searchUI, containerElement.firstChild);

            // 알약(Pill) 컨테이너 초기화 연동
            if (window.BOJ_CF.Components.PillContainer) {
                const pillRoot = document.getElementById('boj-pill-container-root');
                window.BOJ_CF.Components.PillContainer.init(pillRoot);
            }

            this.bindEvents();
            console.log("[BOJ_CF] SearchBar rendered.");
        },

        /**
         * 검색창 이벤트를 바인딩합니다.
         */
        bindEvents: function() {
            const input = document.getElementById('boj-search-input');
            const btn = document.getElementById('boj-search-btn');

            if (!input || !btn) return;

            const triggerSearch = () => {
                const query = input.value.trim();
                if (query && window.BOJ_CF.StateManager) {
                    window.BOJ_CF.StateManager.addFilter(query);
                    input.value = '';
                }
            };

            btn.addEventListener('click', triggerSearch);
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') triggerSearch();
            });
        }
    };
})();