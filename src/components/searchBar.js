/**
 * src/components/searchBar.js
 * 통합 검색창 UI 및 입력 이벤트 핸들러
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
            // 컨테이너의 맨 앞에 검색창 삽입
            containerElement.insertBefore(searchUI, containerElement.firstChild);

            const input = document.getElementById('boj-search-input');
            const btn = document.getElementById('boj-search-btn');

            // 입력값 처리 로직
            const handleInput = () => {
                let val = input.value.replace(',', '').trim();
                if (val.length > 0) {
                    window.BOJ_CF.StateManager.addFilter(val);
                    input.value = ''; // 입력창 비우기
                }
            };

            // 키보드 엔터/쉼표 이벤트
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter' || e.key === ',') handleInput();
            });

            // 키보드 백스페이스로 최근 알약 지우기
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value === '') {
                    const state = window.BOJ_CF.StateManager.getState();
                    if (state.activeFilters.length > 0) {
                        const lastFilter = state.activeFilters[state.activeFilters.length - 1];
                        window.BOJ_CF.StateManager.removeFilter(lastFilter);
                    }
                }
            });

            // 검색 버튼 클릭 이벤트
            btn.addEventListener('click', handleInput);
        }
    };
})();