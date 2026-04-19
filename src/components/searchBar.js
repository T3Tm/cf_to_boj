/**
 * src/components/searchBar.js
 * 통합 검색창 UI 및 디바운스 입력 감지
 */
window.BOJ_CF.Components.SearchBar = (function() {
    return {
        init: function(containerElement) {
            if (document.querySelector('.boj-search-container')) return;

            const searchUI = document.createElement('div');
            searchUI.className = 'boj-search-container';
            searchUI.innerHTML = `
                <div class="boj-search-input-wrapper">
                    <input type="text" id="boj-search-input" autocomplete="off" placeholder="검색어, 태그(예: dp), 난이도(예: *1500) 입력 후 Enter">
                    <button id="boj-search-btn">검색</button>
                </div>
            `;
            containerElement.insertBefore(searchUI, containerElement.firstChild);

            const input = document.getElementById('boj-search-input');
            const btn = document.getElementById('boj-search-btn');

            const handleInput = () => {
                let val = input.value.replace(',', '').trim();
                if (val.length > 0) {
                    window.BOJ_CF.StateManager.addFilter(val);
                    input.value = ''; 
                }
            };

            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter' || e.key === ',') handleInput();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value === '') {
                    const state = window.BOJ_CF.StateManager.getState();
                    if (state.activeFilters.length > 0) {
                        window.BOJ_CF.StateManager.removeFilter(state.activeFilters[state.activeFilters.length - 1]);
                    }
                }
            });

            btn.addEventListener('click', handleInput);
        }
    };
})();