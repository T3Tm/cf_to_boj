window.BOJ_CF.Components.SearchBar = (function() {
    return {
        init: function(container) {
            if (document.querySelector('.boj-search-container')) return;
            const searchUI = document.createElement('div');
            searchUI.className = 'boj-search-container';
            searchUI.innerHTML = `
                            <div class="boj-search-input-wrapper">
                                <input type="text" id="boj-search-input" autocomplete="off" placeholder="예: #dp | r:1500..2000 (solved.ac 문법 지원)">
                                <select id="boj-page-size-select" style="padding: 5px; border-radius: 4px; border: 1px solid var(--boj-border); background: var(--boj-bg); color: var(--boj-text);">
                                    <option value="20">20개씩</option>
                                    <option value="50">50개씩</option>
                                    <option value="100">100개씩</option>
                                </select>
                                <button id="boj-search-btn">검색</button>
                            </div>
                        `;
            container.insertBefore(searchUI, container.firstChild);

            const input = document.getElementById('boj-search-input');
            // handleInput 함수 수정 (토큰화 로직 제거, 통문장 알약 생성)
            const handleInput = () => {
                let val = input.value.trim();
                if (val) {
                    window.BOJ_CF.StateManager.addFilter(val); // 쪼개지 않고 전체를 하나의 필터로 전달
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