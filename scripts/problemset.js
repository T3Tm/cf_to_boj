/**
 * scripts/problemset.js
 */
function transformProblemsetPage() {
    const pc = document.querySelector('#pageContent');
    if (!pc) return;

    // GNB 테마 토글 버튼 주입
    const langChooser = document.querySelector('.lang-chooser');
    if (langChooser && !document.getElementById('boj-theme-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'boj-theme-toggle';
        toggleBtn.innerHTML = '🌓 테마 전환';
        toggleBtn.onclick = Utils.toggleTheme;
        langChooser.insertBefore(toggleBtn, langChooser.firstChild);
    }

    // 기존 폼 무력화 및 검색 UI 삽입
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none'; 

    const searchUI = document.createElement('div');
    searchUI.className = 'boj-search-container';
    searchUI.innerHTML = `
        <div class="boj-search-input-wrapper">
            <input type="text" id="boj-search-input" placeholder="검색어, 태그(예: dp), 난이도(예: *1500) 입력 후 Enter">
            <button id="boj-search-btn">검색</button>
        </div>
        <div id="boj-selected-pills" class="boj-selected-pills"></div>
    `;
    pc.insertBefore(searchUI, pc.firstChild);

    const searchInput = document.getElementById('boj-search-input');
    const searchBtn = document.getElementById('boj-search-btn');
    const pillsContainer = document.getElementById('boj-selected-pills');
    let activeFilters = [];

    // 필터링 엔진 (DOM Reflow 최소화 적용)
    function applyFilters() {
        const rows = document.querySelectorAll('.datatable table tr:not(:first-child)');
        const paginations = document.querySelectorAll('.pagination');
        let visibleCount = 0;

        // 알약이 있으면 페이지네이션 강제 숨김
        paginations.forEach(p => p.style.display = activeFilters.length > 0 ? 'none' : '');

        // 화면 갱신 일괄 처리
        rows.forEach(row => {
            if(row.classList.contains('boj-empty-state')) return; // 기존 안내문 무시
            
            let isMatch = true;
            const textContent = row.innerText.toLowerCase();
            
            // 모든 알약(AND 조건) 검사
            for (let filter of activeFilters) {
                if (!textContent.includes(filter.toLowerCase())) {
                    isMatch = false;
                    break;
                }
            }
            
            row.style.display = isMatch ? 'table-row' : 'none';
            if (isMatch) visibleCount++;
        });

        // 빈 화면(Empty State) 처리
        const existingEmpty = document.querySelector('.boj-empty-state');
        if (existingEmpty) existingEmpty.remove();

        if (visibleCount === 0 && activeFilters.length > 0) {
            const tbody = document.querySelector('.datatable table tbody') || document.querySelector('.datatable table');
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'boj-empty-state';
            emptyRow.innerHTML = `<td colspan="5" style="text-align:center; padding:30px; color:#888;">검색 조건과 일치하는 문제가 없습니다.</td>`;
            tbody.appendChild(emptyRow);
        }
    }

    function createPill(text) {
        if(activeFilters.includes(text)) return;
        activeFilters.push(text);
        
        const pill = document.createElement('div');
        pill.className = 'boj-pill';
        pill.innerHTML = `<span>${text}</span><button class="boj-pill-remove">✕</button>`;
        pill.querySelector('.boj-pill-remove').addEventListener('click', () => {
            pill.remove();
            activeFilters = activeFilters.filter(f => f !== text);
            applyFilters();
        });
        pillsContainer.appendChild(pill);
        applyFilters();
    }

    // 이벤트 리스너
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            let val = searchInput.value.replace(',', '').trim();
            if (val.length > 0) { createPill(val); searchInput.value = ''; }
        }
    });
    
    searchBtn.addEventListener('click', () => {
        let val = searchInput.value.trim();
        if (val.length > 0) { createPill(val); searchInput.value = ''; }
        applyFilters();
    });

    // 티어 렌더링 함수
    function applyTiersToTable() {
        document.querySelectorAll('.datatable table tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                const idLink = cells[0].querySelector('a');
                if (idLink && !idLink.querySelector('img')) {
                    const ratingSpan = cells[3].querySelector('span');
                    const ratingValue = ratingSpan ? ratingSpan.innerText.trim() : '';
                    const iconUrl = chrome.runtime.getURL(Utils.getProblemTierIcon(ratingValue));
                    idLink.innerHTML = `<img src="${iconUrl}" style="width:14px; height:18px; vertical-align:-3px; margin-right:5px;">` + idLink.innerHTML;
                }
            }
        });
        if(activeFilters.length > 0) applyFilters(); // AJAX로 새로고침될 경우 필터 재적용
    }

    applyTiersToTable();

    // AJAX 통신으로 화면 덮어씌워짐 감지 및 복구
    const dataTableContainer = document.querySelector('.datatable');
    if (dataTableContainer) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) applyTiersToTable();
            });
        });
        observer.observe(dataTableContainer, { childList: true, subtree: true });
    }
}