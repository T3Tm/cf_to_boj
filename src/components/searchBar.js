window.BOJ_CF.Components.SearchBar = (function() {
    return {
        init: function(container) {
            if (document.querySelector('.boj-search-container')) return;
            const div = document.createElement('div');
            div.className = 'boj-search-container';
            div.innerHTML = `<div class="boj-search-input-wrapper"><input type="text" id="boj-search-input" autocomplete="off" placeholder="검색어, 태그(tag:dp), 레이팅(*1500), 안푼문제(~@me) 입력 후 Enter"><button id="boj-search-btn">검색</button></div>`;
            container.insertBefore(div, container.firstChild);

            const input = document.getElementById('boj-search-input');
            const handleInput = () => {
                let val = input.value.trim();
                if (val) {
                    val.split(/\s+/).forEach(token => window.BOJ_CF.StateManager.addFilter(token));
                    input.value = ''; 
                }
            };
            input.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleInput(); });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value) {
                    const state = window.BOJ_CF.StateManager.getState();
                    if (state.activeFilters.length > 0) window.BOJ_CF.StateManager.removeFilter(state.activeFilters[state.activeFilters.length - 1]);
                }
            });
            document.getElementById('boj-search-btn').addEventListener('click', handleInput);
        }
    };
})();