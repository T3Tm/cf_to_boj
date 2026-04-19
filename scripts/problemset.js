/**
 * scripts/problemset.js
 * 전체 문제 목록 페이지 (통합 검색창 탑재 및 레이아웃 버그 해결)
 */
function transformProblemsetPage() {
    document.querySelectorAll('#header, .menu-box, #footer, .second-level-menu').forEach(el => {
        if(el) el.style.display = 'none';
    });

    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');
    bojContainer.innerHTML = UI.generateHeader("문제", -1, '', '');

    const problemTabs = bojContainer.querySelector('.boj-tabs');
    if (problemTabs) problemTabs.style.display = 'none';

    UI.attachNavigation(bojContainer);

    const pc = document.querySelector('#pageContent');
    if (pc) {
        pc.parentNode.insertBefore(bojContainer, pc);
        pc.classList.add('boj-main-container', 'problemset-mode');

        // 기존 사이드바 폼 무력화
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none'; 

        // [추가] 통합 검색 UI 삽입 (레이아웃 충돌 안 나게 블록화)
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

        // 검색창 알약(Pill) 생성 이벤트
        const searchInput = document.getElementById('boj-search-input');
        const pillsContainer = document.getElementById('boj-selected-pills');

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

        function createPill(text) {
            const pill = document.createElement('div');
            pill.className = 'boj-pill';
            pill.innerHTML = `<span>${text}</span><button class="boj-pill-remove">✕</button>`;
            pill.querySelector('.boj-pill-remove').addEventListener('click', () => {
                pill.remove();
            });
            pillsContainer.appendChild(pill);
        }

        // [수정] 상단 페이지네이션 숨김 처리 (레이아웃 충돌 핵심 원인 제거)
        const paginations = document.querySelectorAll('.pagination');
        if (paginations.length > 0) {
            paginations[0].style.display = 'none'; 
            if (paginations.length > 1) {
                paginations[1].style.marginTop = '30px'; 
            }
        }

        // 기존 테이블 렌더링
        document.querySelectorAll('.datatable').forEach(dt => {
            dt.style.backgroundColor = 'transparent';
            dt.style.padding = '0';
            dt.querySelectorAll('.lt, .rt, .lb, .rb, .ilt, .irt').forEach(el => el.style.display = 'none');

            const titleDiv = dt.querySelector('div[style*="padding: 4px"]');
            if (titleDiv) titleDiv.style.display = 'none';

            const table = dt.querySelector('table');
            if (table) {
                table.classList.add('boj-table');
                
                const headers = table.querySelectorAll('th');
                const updateSortHeader = (th, baseText) => {
                    if (!th) return;
                    const aTag = th.querySelector('a');
                    if (aTag) {
                        const href = aTag.getAttribute('href') || '';
                        let arrow = '↕'; 
                        const currentOrder = new URLSearchParams(window.location.search).get('order');
                        if (href.includes('BY_RATING')) {
                            if (currentOrder === 'BY_RATING_ASC') arrow = '▲';
                            else if (currentOrder === 'BY_RATING_DESC') arrow = '▼';
                        }
                        aTag.innerHTML = `${baseText} <span style="font-size: 12px; color: #0076c0;">${arrow}</span>`;
                        aTag.style.color = '#333';
                        aTag.style.textDecoration = 'none';
                    } else {
                        th.innerText = baseText;
                    }
                };

                if (headers.length >= 4) {
                    updateSortHeader(headers[0], '문제');
                    updateSortHeader(headers[1], '제목');
                    updateSortHeader(headers[2], ' '); 
                    updateSortHeader(headers[3], '난이도');
                }
                
                table.querySelectorAll('tr').forEach(row => {
                    row.querySelectorAll('td').forEach(td => td.className = '');

                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        const idLink = cells[0].querySelector('a');
                        const ratingSpan = cells[3].querySelector('span');
                        const ratingValue = ratingSpan ? ratingSpan.innerText.trim() : '';
                        
                        const iconUrl = chrome.runtime.getURL(Utils.getProblemTierIcon(ratingValue));
                        
                        if(idLink) {
                            idLink.innerHTML = `<img src="${iconUrl}" style="width:14px; height:18px; vertical-align:-3px; margin-right:5px;">` + idLink.innerHTML;
                        }
                    }
                });
            }
        });
    }
}