window.BOJ_CF.Components.SearchBar = (function() {
    return {
        init: function(containerElement) {
            if (document.querySelector('.boj-search-container')) return;

            // 1. HTML 뼈대 생성
            const searchUI = document.createElement('div');
            searchUI.className = 'boj-search-container';
            searchUI.innerHTML = `
                <div class="boj-search-input-wrapper">
                    <input type="text" id="boj-search-input" autocomplete="off" placeholder="예: #dp | r:1500..2000 (solved.ac 문법 지원)">
                    <select id="boj-page-size-select" style="padding: 5px 10px; border-radius: 4px; border: 1px solid var(--boj-border); background: var(--boj-bg); color: var(--boj-text); font-weight: bold; cursor: pointer;">
                        <option value="20">20개씩</option>
                        <option value="50">50개씩</option>
                        <option value="100">100개씩</option>
                    </select>
                    <button id="boj-search-btn">검색</button>
                </div>
            `;

            // 2. DOM에 먼저 삽입 (이 줄이 무조건 이벤트 바인딩보다 먼저 와야 함)
            containerElement.insertBefore(searchUI, containerElement.firstChild);

           // 3. [수정된 부분] 전역 탐색(document) 대신, 지역 탐색(searchUI)으로 요소 찾기
            const input = searchUI.querySelector('#boj-search-input');
            const btn = searchUI.querySelector('#boj-search-btn');

            const handleInput = () => {
                let val = input.value.trim();
                if (val.length > 0) {
                    window.BOJ_CF.StateManager.addFilter(val);
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

            // 검색 버튼 클릭 이벤트 정상 복구
            btn.addEventListener('click', handleInput);
        }
    };
})();