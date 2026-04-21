/**
 * src/pages/status.js (v3.8.0)
 * 채점 현황 컨트롤러 (20개씩 페이징 및 BOJ 스타일 완벽 구현)
 */
window.BOJ_CF.Pages.Status = (function() {
    let currentPage = 1;
    const itemsPerPage = 20;

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // 1. 상태 분석
            const params = new URLSearchParams(window.location.search);
            const pathParts = window.location.pathname.split('/');
            const contestId = params.get('contestId') || (pathParts[1] === 'contest' ? pathParts[2] : (pathParts[2] === 'status' ? pathParts[3] : null));
            const problemIndex = params.get('index') || params.get('problemIndex') || (pathParts[1] === 'contest' ? pathParts[4] : (pathParts[2] === 'status' ? pathParts[5] : null));
            const isProblemStatus = !!(contestId && problemIndex);
            const myHandle = document.querySelector('.boj-header-user')?.innerText.trim();
            const isLoggedIn = !!myHandle && myHandle !== 'Unknown';

            // 2. UI 클린업
            const cleanup = () => {
                const selectors = [
                    '.second-level-menu', '.nav-links', '.info-bar', '.side-navigation', 
                    '.friendsEnabledSwitch', '.myEnabledSwitch', '.lang-chooser', 
                    '.menu-box', 'div[style*="float:right"]', '.pagination'
                ];
                selectors.forEach(s => document.querySelectorAll(s).forEach(el => {
                    if (s.includes('float:right') && !el.innerText.toLowerCase().includes('only')) return;
                    el.remove();
                }));
            };
            cleanup();

            // 3. 헤더 및 필터 주입
            const manageUI = () => {
                if (isProblemStatus) {
                    let tabMenu = document.querySelector('.problem-menu');
                    if (!tabMenu) {
                        tabMenu = document.createElement('ul');
                        tabMenu.className = 'nav nav-pills problem-menu';
                        tabMenu.innerHTML = `
                            <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                            <li><a href="/problemset/submit?contestId=${contestId}&problemIndex=${problemIndex}">제출</a></li>
                            <li class="active"><a href="#">채점 현황</a></li>
                        `;
                        pc.insertBefore(tabMenu, pc.firstChild);
                    }
                }

                if (!document.getElementById('boj-status-header')) {
                    const header = document.createElement('div');
                    header.id = 'boj-status-header';
                    header.className = 'page-header';
                    header.innerHTML = `<h1 style="text-align: left;">${isProblemStatus ? `${contestId}${problemIndex}번 채점 현황` : '채점 현황'}</h1>`;
                    const anchor = document.querySelector('.problem-menu') || pc.firstChild;
                    if (anchor === pc.firstChild) pc.insertBefore(header, pc.firstChild);
                    else anchor.insertAdjacentElement('afterend', header);

                    const filter = document.createElement('div');
                    filter.className = 'boj-status-filter';
                    filter.style.cssText = 'margin-bottom: 25px; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; display: flex; gap: 25px; align-items: center;';
                    filter.innerHTML = `
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; color: #333;">
                            <input type="checkbox" id="chk-my-subs" ${params.get('handle') === myHandle ? 'checked' : ''} ${!isLoggedIn ? 'disabled' : ''}> 내 제출
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; color: #333;">
                            <input type="checkbox" id="chk-follow-subs" ${params.get('friends') === 'on' ? 'checked' : ''} ${!isLoggedIn ? 'disabled' : ''}> 팔로우 제출
                        </label>
                    `;
                    header.insertAdjacentElement('afterend', filter);

                    const update = (key, val, active) => {
                        const p = new URLSearchParams(window.location.search);
                        if (active) p.set(key, val); else p.delete(key);
                        window.location.search = p.toString();
                    };
                    document.getElementById('chk-my-subs')?.addEventListener('change', e => update('handle', myHandle, e.target.checked));
                    document.getElementById('chk-follow-subs')?.addEventListener('change', e => update('friends', 'on', e.target.checked));
                }
            };
            manageUI();

            // 4. 테이블 변환 및 페이징 로직
            const transformTable = async () => {
                const table = document.querySelector('table.status-frame-datatable, .status-frame-datatable table, table.datatable, .datatable table');
                if (!table) return;

                table.classList.add('boj-status-table');
                table.style.setProperty('display', 'table', 'important');
                
                // 헤더 번역
                const headerMap = {'#': '제출 번호', 'Who': '아이디', 'Problem': '문제', 'Verdict': '결과', 'Memory': '메모리', 'Time': '시간', 'Lang': '언어', 'When': '제출 시간', 'Sent': '제출 시간'};
                const headers = Array.from(table.querySelectorAll('th'));
                headers.forEach(th => {
                    const txt = th.innerText.trim();
                    for (const [k, v] of Object.entries(headerMap)) if (txt.startsWith(k)) th.innerText = v;
                });

                // 행 페이징 처리
                const allRows = Array.from(table.querySelectorAll('tr[data-submission-id], tr[submissionid]'));
                const totalPages = Math.ceil(allRows.length / itemsPerPage);
                
                allRows.forEach((row, idx) => {
                    const isVisible = idx >= (currentPage - 1) * itemsPerPage && idx < currentPage * itemsPerPage;
                    row.style.display = isVisible ? '' : 'none';
                    
                    if (isVisible) {
                        // 결과 번역
                        const verdictCell = row.querySelector('.verdict-accepted, .verdict-rejected, .verdict-waiting, [class*="verdict"]');
                        if (verdictCell) {
                            const vt = verdictCell.innerText.toLowerCase();
                            if (vt.includes('accepted')) { verdictCell.innerText = '맞았습니다!!'; verdictCell.className = 'verdict-accepted'; }
                            else if (vt.includes('wrong')) { verdictCell.innerText = '틀렸습니다'; verdictCell.className = 'verdict-rejected'; }
                            else if (vt.includes('time limit')) { verdictCell.innerText = '시간 초과'; verdictCell.className = 'verdict-rejected'; }
                            else if (vt.includes('memory limit')) { verdictCell.innerText = '메모리 초과'; verdictCell.className = 'verdict-rejected'; }
                            else if (vt.includes('runtime error')) { verdictCell.innerText = '런타임 에러'; verdictCell.className = 'verdict-rejected'; }
                            else if (vt.includes('compilation error')) { verdictCell.innerText = '컴파일 에러'; verdictCell.className = 'verdict-rejected'; }
                        }
                        // 티어 아이콘
                        const probColIndex = headers.findIndex(th => th.innerText.includes('문제'));
                        if (probColIndex !== -1) {
                            const cell = row.cells[probColIndex]?.querySelector('a');
                            if (cell && !cell.querySelector('img')) {
                                const match = cell.innerText.trim().match(/([0-9]+)([A-Z][0-9]*)/);
                                const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(null)); // 단순화된 주입
                                cell.insertAdjacentHTML('afterbegin', `<img src="${iconUrl}" class="boj-tier-icon" style="width:16px; vertical-align:middle; margin-right:4px;">`);
                            }
                        }
                    }
                });

                // 페이지네이션 컨트롤
                let pager = document.getElementById('boj-status-pager');
                if (!pager) {
                    pager = document.createElement('div');
                    pager.id = 'boj-status-pager';
                    pager.className = 'boj-pager';
                    pager.style.cssText = 'display: flex; justify-content: center; gap: 10px; margin-top: 20px;';
                    table.insertAdjacentElement('afterend', pager);
                }
                pager.innerHTML = `
                    <button class="btn-boj-pager" ${currentPage === 1 ? 'disabled' : ''} id="prev-page">이전</button>
                    <span style="align-self: center; font-weight: bold;">${currentPage} / ${totalPages || 1}</span>
                    <button class="btn-boj-pager" ${currentPage >= totalPages ? 'disabled' : ''} id="next-page">다음</button>
                `;
                
                document.getElementById('prev-page')?.addEventListener('click', () => { currentPage--; transformTable(); window.scrollTo(0, 0); });
                document.getElementById('next-page')?.addEventListener('click', () => { currentPage++; transformTable(); window.scrollTo(0, 0); });
            };

            await transformTable();
            window.BOJ_CF.DOMObserver.init('.status-frame-datatable, table.datatable');
            window.BOJ_CF.DOMObserver.subscribe(() => { cleanup(); transformTable(); });
        }
    };
})();