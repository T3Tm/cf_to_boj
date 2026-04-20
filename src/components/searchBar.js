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

           // HTML 삽입 후 실행되는 전역 이벤트 위임
            document.body.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'boj-search-btn') {
                    const input = document.getElementById('boj-search-input');
                    let val = input ? input.value.trim() : '';
                    if (val.length > 0) {
                        window.BOJ_CF.StateManager.addFilter(val);
                        if(input) input.value = '';
                    }
                }
            });

            document.body.addEventListener('keyup', (e) => {
                if (e.target && e.target.id === 'boj-search-input') {
                    if (e.key === 'Enter') {
                        let val = e.target.value.trim();
                        if (val.length > 0) {
                            window.BOJ_CF.StateManager.addFilter(val);
                            e.target.value = '';
                        }
                    }
                }
            });
        }
    };
})();