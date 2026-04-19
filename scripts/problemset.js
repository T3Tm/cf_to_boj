/**
 * scripts/problemset.js
 * 전체 문제 목록 (통합 검색 및 AJAX 증발 방어)
 */
function transformProblemsetPage() {
    document.querySelectorAll('#header, .menu-box, #footer, .second-level-menu').forEach(el => {
        if(el) el.style.display = 'none';
    });

    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');
    bojContainer.innerHTML = UI.generateHeader("문제", -1, '', '');
    UI.attachNavigation(bojContainer);

    const pc = document.querySelector('#pageContent');
    if (!pc) return;

    pc.parentNode.insertBefore(bojContainer, pc);
    pc.classList.add('boj-main-container', 'problemset-mode');

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none'; 

    // 통합 검색 UI
    const searchUI = document.createElement('div');
    searchUI.className = 'boj-search-container';
    searchUI.innerHTML = `
        <div class="boj-search-input-wrapper">
            <input type="text" id="boj-search-input" placeholder="검색어, 태그(예: dp), 난이도(예: *s1..g5) 입력 후 Enter">
            <button id="boj-search-btn">검색</button>
        </div>
        <div id="boj-selected-pills" class="boj-selected-pills"></div>
    `;
    pc.insertBefore(searchUI, pc.firstChild);

    const searchInput = document.getElementById('boj-search-input');
    const searchBtn = document.getElementById('boj-search-btn');
    const pillsContainer = document.getElementById('boj-selected-pills');

    // 알약 생성기
    function createPill(text) {
        const pill = document.createElement('div');
        pill.className = 'boj-pill';
        pill.innerHTML = `<span>${text}</span><button class="boj-pill-remove">✕</button>`;
        pill.querySelector('.boj-pill-remove').addEventListener('click', () => pill.remove());
        pillsContainer.appendChild(pill);
    }

    // 키보드 이벤트
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            let val = searchInput.value.replace(',', '').trim();
            if (val.length > 0) {
                createPill(val);
                searchInput.value = '';
            }
        }
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && searchInput.value === '') {
            if (pillsContainer.lastChild) pillsContainer.removeChild(pillsContainer.lastChild);
        }
    });

    // [신규] 마우스 클릭 이벤트 바인딩
    searchBtn.addEventListener('click', () => {
        let val = searchInput.value.trim();
        if (val.length > 0) {
            createPill(val);
            searchInput.value = '';
        }
        // TODO: 향후 SPA 필터링 엔진 실행 함수 (ex. executeSearch()) 호출부
        console.log("검색 로직 실행됨!"); 
    });

    // 상단 페이지네이션 숨김 (레이아웃 충돌 방어)
    const paginations = document.querySelectorAll('.pagination');
    if (paginations.length > 0) paginations[0].style.display = 'none'; 

    // 테이블 렌더링 함수 (재사용을 위해 분리)
    function applyTiersToTable() {
        document.querySelectorAll('.datatable table').forEach(table => {
            table.classList.add('boj-table');
            table.querySelectorAll('tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) {
                    const idLink = cells[0].querySelector('a');
                    const ratingSpan = cells[3].querySelector('span');
                    
                    // 이미 아이콘이 삽입되었는지 체크 (중복 방지)
                    if (idLink && !idLink.querySelector('img')) {
                        const ratingValue = ratingSpan ? ratingSpan.innerText.trim() : '';
                        const iconUrl = chrome.runtime.getURL(Utils.getProblemTierIcon(ratingValue));
                        idLink.innerHTML = `<img src="${iconUrl}" style="width:14px; height:18px; vertical-align:-3px; margin-right:5px;">` + idLink.innerHTML;
                    }
                }
            });
        });
    }

    applyTiersToTable();

    // [신규] AJAX 감시자 (표가 서버로부터 갱신될 때마다 아이콘 복구)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                applyTiersToTable();
            }
        });
    });
    
    const dataTableContainer = document.querySelector('.datatable');
    if (dataTableContainer) {
        observer.observe(dataTableContainer, { childList: true, subtree: true });
    }
}