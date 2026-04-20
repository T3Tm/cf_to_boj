window.BOJ_CF.Components.SearchBar = (function() {
    let initialized = false;
    return {
        init: function(containerElement) {
            if (document.querySelector('.boj-search-container')) return;

            const searchUI = document.createElement('div');
            searchUI.className = 'boj-search-container';
            searchUI.innerHTML = `
                <div class="boj-search-input-wrapper">
                    <input type="text" id="boj-search-input" autocomplete="off" placeholder="예: #dp | r:1500..2000 (solved.ac 문법 지원)">
                    <select id="boj-page-size-select">
                        <option value="20">20개씩</option>
                        <option value="50">50개씩</option>
                        <option value="100">100개씩</option>
                    </select>
                    <button id="boj-search-btn">검색</button>
                </div>
            `;
            containerElement.insertBefore(searchUI, containerElement.firstChild);

            if (!initialized) {
                document.body.addEventListener('click', (e) => {
                    if (e.target.id === 'boj-search-btn') {
                        const input = document.getElementById('boj-search-input');
                        if (input && input.value.trim()) {
                            window.BOJ_CF.StateManager.addFilter(input.value.trim());
                            input.value = '';
                        }
                    }
                });
                document.body.addEventListener('keyup', (e) => {
                    if (e.target.id === 'boj-search-input' && e.key === 'Enter') {
                        if (e.target.value.trim()) {
                            window.BOJ_CF.StateManager.addFilter(e.target.value.trim());
                            e.target.value = '';
                        }
                    }
                });
                initialized = true;
            }
        }
    };
})();