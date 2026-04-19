window.BOJ_CF.Components.SearchBar = (function() {
    return {
        init: function(containerElement) {
            if (document.querySelector('.boj-search-container')) return;

            const searchUI = document.createElement('div');
            searchUI.className = 'boj-search-container';
            searchUI.innerHTML = `
                <div class="boj-search-input-wrapper">
                    <input type="text" id="boj-search-input" autocomplete="off" placeholder="검색어, 태그(tag:dp), 레이팅(*1500), 안푼문제(~@me) 입력 후 Enter">
                    <button id="boj-search-btn">검색</button>
                </div>
            `;
            containerElement.insertBefore(searchUI, containerElement.firstChild);

            const input = document.getElementById('boj-search-input');
            const handleInput = () => {
                let val = input.value.trim();
                if (val.length > 0) {
                    // 띄어쓰기 기준으로 토큰화하여 다중 알약 동시 생성
                    const tokens = val.split(/\s+/);
                    tokens.forEach(token => {
                        window.BOJ_CF.StateManager.addFilter(token);
                    });
                    input.value = ''; 
                }
            };

            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') handleInput();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value === '') {
                    const state = window.BOJ_CF.StateManager.getState();
                    if (state.activeFilters.length > 0) {
                        window.BOJ_CF.StateManager.removeFilter(state.activeFilters[state.activeFilters.length - 1]);
                    }
                }
            });
            document.getElementById('boj-search-btn').addEventListener('click', handleInput);
        }
    };
})();