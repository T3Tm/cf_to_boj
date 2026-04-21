/**
 * src/pages/status.js (v4.0.0)
 * [Logic Stabilization] 채점 현황 컨트롤러 (20개씩 페이징 & AJAX 완벽 대응)
 */
window.BOJ_CF.Pages.Status = (function() {
    let currentPage = 1;
    const itemsPerPage = 20;
    let problemsDB = null;

    /**
     * 불필요한 코드포스 요소를 제거합니다.
     */
    function cleanup() {
        const selectors = [
            '.second-level-menu', '.nav-links', '.info-bar', '.side-navigation', 
            '.friendsEnabledSwitch', '.myEnabledSwitch', '.lang-chooser', 
            '.menu-box', 'div[style*="float:right"]:not(.boj-processed)', '.pagination'
        ];
        selectors.forEach(s => {
            document.querySelectorAll(s).forEach(el => {
                if (el.innerText.toLowerCase().includes('only') || el.id?.startsWith('boj-')) return;
                el.classList.add('boj-processed'); // 처리됨 표시
                el.style.display = 'none';
            });
        });
    }

    /**
     * 채점 현황 테이블을 백준 스타일로 변환합니다.
     */
    async function transformTable() {
        const table = document.querySelector('table.status-frame-datatable, table.datatable, .status-frame-datatable table, .datatable table');
        if (!table || table.classList.contains('boj-processed-table')) return;

        console.log("[BOJ_CF] Transforming Status Table...");
        table.classList.add('boj-processed-table', 'boj-status-table');

        // 1. 헤더 번역
        const headerMap = {'#': '제출 번호', 'Who': '아이디', 'Problem': '문제', 'Verdict': '결과', 'Memory': '메모리', 'Time': '시간', 'Lang': '언어', 'When': '제출 시간', 'Sent': '제출 시간'};
        const headers = Array.from(table.querySelectorAll('th'));
        headers.forEach(th => {
            const txt = th.innerText.trim();
            for (const [k, v] of Object.entries(headerMap)) {
                if (txt.startsWith(k)) { th.innerText = v; break; }
            }
        });

        // 2. 행 데이터 처리
        const allRows = Array.from(table.querySelectorAll('tr[data-submission-id], tr[submissionid]'));
        const totalPages = Math.ceil(allRows.length / itemsPerPage) || 1;
        
        allRows.forEach((row, idx) => {
            const isVisible = idx >= (currentPage - 1) * itemsPerPage && idx < currentPage * itemsPerPage;
            row.style.display = isVisible ? '' : 'none';
            
            if (isVisible && !row.classList.contains('boj-processed')) {
                // 결과 번역 및 색상 적용
                const verdictCell = row.querySelector('.verdict-accepted, .verdict-rejected, .verdict-waiting, [class*="verdict"]');
                if (verdictCell) {
                    const vt = verdictCell.innerText.toLowerCase();
                    if (vt.includes('accepted')) { 
                        verdictCell.innerText = '맞았습니다!!'; 
                        verdictCell.style.color = '#009874'; 
                        verdictCell.style.fontWeight = 'bold';
                    }
                    else if (vt.includes('wrong')) verdictCell.innerText = '틀렸습니다';
                    else if (vt.includes('time limit')) verdictCell.innerText = '시간 초과';
                    else if (vt.includes('memory limit')) verdictCell.innerText = '메모리 초과';
                    else if (vt.includes('runtime error')) verdictCell.innerText = '런타임 에러';
                    else if (vt.includes('compilation error')) verdictCell.innerText = '컴파일 에러';
                }

                // 티어 아이콘 주입
                const probColIndex = headers.findIndex(th => th.innerText.includes('문제'));
                if (probColIndex !== -1) {
                    const link = row.cells[probColIndex]?.querySelector('a');
                    if (link && !link.querySelector('.boj-tier-icon')) {
                        const probText = link.innerText.trim(); // 예: "123A"
                        const match = probText.match(/([0-9]+)([A-Z][0-9]*)/);
                        
                        let rating = null;
                        if (match && problemsDB) {
                            const cId = match[1];
                            const pIdx = match[2];
                            const pData = problemsDB.find(p => p.contestId == cId && p.index == pIdx);
                            rating = pData ? pData.rating : null;
                        }

                        const iconPath = window.BOJ_CF.TierCalculator.getProblemTierIcon(rating);
                        const iconUrl = chrome.runtime.getURL(iconPath);
                        link.insertAdjacentHTML('afterbegin', `<img src="${iconUrl}" class="boj-tier-icon" style="width:16px; vertical-align:middle; margin-right:4px;">`);
                    }
                }
                row.classList.add('boj-processed');
            }
        });

        renderPager(table, totalPages);
    }

    /**
     * 페이지네이션 바를 렌더링합니다.
     */
    function renderPager(table, totalPages) {
        let pager = document.getElementById('boj-status-pager');
        if (!pager) {
            pager = document.createElement('div');
            pager.id = 'boj-status-pager';
            pager.className = 'boj-pager';
            pager.style.cssText = 'display: flex; justify-content: center; gap: 15px; margin-top: 25px; padding-bottom: 30px;';
            table.insertAdjacentElement('afterend', pager);
        }

        pager.innerHTML = `
            <button class="boj-btn-pager" ${currentPage === 1 ? 'disabled' : ''} id="boj-prev-page">이전</button>
            <span style="align-self: center; font-weight: bold; font-size: 15px;">${currentPage} / ${totalPages}</span>
            <button class="boj-btn-pager" ${currentPage >= totalPages ? 'disabled' : ''} id="boj-next-page">다음</button>
        `;
        
        document.getElementById('boj-prev-page')?.addEventListener('click', () => { 
            currentPage--; 
            resetTableAndRender(); 
            window.scrollTo(0, 0); 
        });
        document.getElementById('boj-next-page')?.addEventListener('click', () => { 
            currentPage++; 
            resetTableAndRender(); 
            window.scrollTo(0, 0); 
        });
    }

    function resetTableAndRender() {
        const table = document.querySelector('.boj-processed-table');
        if (table) table.classList.remove('boj-processed-table');
        document.querySelectorAll('.boj-status-table tr.boj-processed').forEach(r => r.classList.remove('boj-processed'));
        transformTable();
    }

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // 1. 데이터 로드 (정확한 티어 표시용)
            const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
            problemsDB = allProbs ? allProbs.problems : [];

            // 2. 초기 렌더링
            cleanup();
            await transformTable();

            // 3. 안정화 연동: DOMObserver 감시 시작
            if (window.BOJ_CF.Utils.DOMObserver) {
                window.BOJ_CF.Utils.DOMObserver.observe('#pageContent', () => {
                    cleanup();
                    // 테이블 자체가 날아갔거나 내용이 바뀌었을 수 있으므로 클래스 제거 후 재검토
                    const table = document.querySelector('.boj-status-table');
                    if (table) table.classList.remove('boj-processed-table');
                    transformTable();
                });
            }
        }
    };
})();