/**
 * src/pages/status.js (v3.6.0)
 * 채점 현황 컨트롤러 (BOJ 스타일 완벽 구현 및 필터 로직 교정)
 */
window.BOJ_CF.Pages.Status = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // 1. URL 및 파라미터 분석 (CF 네이티브 필터링 연동)
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('index') || params.get('problemIndex');
            const handleParam = params.get('handle');
            const friendsParam = params.get('friends');
            
            const isProblemStatus = !!(contestId && problemIndex);
            const myHandle = document.querySelector('.boj-header-user')?.innerText.trim();
            const isLoggedIn = !!myHandle && myHandle !== 'Unknown';

            // 2. UI 정리 및 클린업
            const cleanup = () => {
                const selectors = [
                    '.second-level-menu', '.nav-links', '.info-bar', 
                    '.side-navigation', '.friendsEnabledSwitch', '.myEnabledSwitch',
                    '.lang-chooser', '.menu-box'
                ];
                selectors.forEach(s => document.querySelectorAll(s).forEach(el => {
                    const wrapper = el.closest('div[style*="float:right"]');
                    if (wrapper) wrapper.remove();
                    else el.remove();
                }));
                
                document.querySelectorAll('a, span, label').forEach(el => {
                    const txt = el.innerText.toLowerCase();
                    if (txt.includes('my only') || txt.includes('friends only')) {
                        el.closest('div')?.remove() || el.remove();
                    }
                });
            };
            cleanup();

            // 3. 탭 메뉴 및 헤더 주입
            const manageUI = () => {
                // 문제 탭 메뉴 (문제별 현황일 때만)
                let tabMenu = document.querySelector('.problem-menu');
                if (isProblemStatus) {
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
                } else if (tabMenu) tabMenu.remove();

                // 백준 스타일 헤더
                let statusHeader = document.getElementById('boj-status-header');
                if (!statusHeader) {
                    statusHeader = document.createElement('div');
                    statusHeader.id = 'boj-status-header';
                    statusHeader.className = 'page-header';
                    const title = isProblemStatus ? `${contestId}${problemIndex}번 채점 현황` : '채점 현황';
                    statusHeader.innerHTML = `<h1 style="text-align: left;">${title}</h1>`;
                    
                    const anchor = document.querySelector('.problem-menu') || pc.firstChild;
                    if (anchor === pc.firstChild) pc.insertBefore(statusHeader, pc.firstChild);
                    else anchor.insertAdjacentElement('afterend', statusHeader);

                    // 필터 박스
                    const filterForm = document.createElement('div');
                    filterForm.className = 'boj-status-filter';
                    filterForm.style.cssText = 'margin-bottom: 20px; padding: 15px; background: var(--boj-table-stripe); border-radius: 4px; display: flex; gap: 20px; align-items: center; border: 1px solid var(--boj-border);';
                    
                    const myChecked = isLoggedIn && handleParam === myHandle ? 'checked' : '';
                    const followChecked = isLoggedIn && friendsParam === 'on' ? 'checked' : '';
                    const disabledAttr = !isLoggedIn ? 'disabled' : '';

                    filterForm.innerHTML = `
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 500; color: var(--boj-text);">
                            <input type="checkbox" id="chk-my-subs" ${myChecked} ${disabledAttr}> 내 제출
                        </label>
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 500; color: var(--boj-text);">
                            <input type="checkbox" id="chk-follow-subs" ${followChecked} ${disabledAttr}> 팔로우 제출
                        </label>
                    `;
                    statusHeader.insertAdjacentElement('afterend', filterForm);

                    // 필터 이벤트 (기존 파라미터 보존하며 이동)
                    const updateFilter = (key, val, active) => {
                        const newParams = new URLSearchParams(window.location.search);
                        if (active) newParams.set(key, val);
                        else newParams.delete(key);
                        window.location.search = newParams.toString();
                    };

                    document.getElementById('chk-my-subs')?.addEventListener('change', (e) => updateFilter('handle', myHandle, e.target.checked));
                    document.getElementById('chk-follow-subs')?.addEventListener('change', (e) => updateFilter('friends', 'on', e.target.checked));
                }
            };
            manageUI();

            // 4. 테이블 변환 (BOJ 스타일)
            const transformTable = async () => {
                const table = document.querySelector('table.status-frame-datatable, .status-frame-datatable table, table.datatable, .datatable table');
                if (!table) return;

                // CF 고유 클래스 제거 및 BOJ 스타일 클래스 주입
                table.classList.add('boj-status-table');
                table.style.setProperty('display', 'table', 'important');
                
                // 부모 요소 가시성 확보
                let parent = table.parentElement;
                while (parent && parent !== pc) {
                    if (parent.classList.contains('datatable') || parent.classList.contains('status-frame-datatable') || parent.classList.contains('roundbox')) {
                        parent.style.setProperty('display', 'block', 'important');
                    }
                    parent = parent.parentElement;
                }

                // 헤더 번역
                const headerMap = {
                    '#': '제출 번호', 'Who': '아이디', 'Problem': '문제', 'Verdict': '결과',
                    'Memory': '메모리', 'Time': '시간', 'Lang': '언어', 'When': '제출 시간', 'Sent': '제출 시간'
                };
                const headers = Array.from(table.querySelectorAll('th'));
                headers.forEach(th => {
                    const text = th.innerText.trim();
                    for (const [k, v] of Object.entries(headerMap)) {
                        if (text.startsWith(k)) { th.innerText = v; break; }
                    }
                });

                // 데이터 행 및 티어 아이콘
                const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
                const probMap = {};
                const problems = allProbs?.problems || (Array.isArray(allProbs) ? allProbs : []);
                problems.forEach(p => { probMap[`${p.contestId}${p.index}`] = p.rating; });

                const probColIndex = headers.findIndex(th => th.innerText.includes('문제'));
                
                table.querySelectorAll('tr[data-submission-id], tr[submissionid]').forEach(row => {
                    // 결과 텍스트 및 색상 매핑
                    const verdictCell = row.querySelector('.verdict-accepted, .verdict-rejected, .verdict-waiting, [class*="verdict"]');
                    if (verdictCell) {
                        const vt = verdictCell.innerText.toLowerCase();
                        if (vt.includes('accepted')) {
                            verdictCell.innerText = '맞았습니다!!';
                            verdictCell.className = 'verdict-accepted';
                        } else if (vt.includes('wrong')) {
                            verdictCell.innerText = '틀렸습니다';
                            verdictCell.className = 'verdict-rejected';
                        } else if (vt.includes('time limit')) {
                            verdictCell.innerText = '시간 초과';
                            verdictCell.className = 'verdict-rejected';
                        } else if (vt.includes('memory limit')) {
                            verdictCell.innerText = '메모리 초과';
                            verdictCell.className = 'verdict-rejected';
                        } else if (vt.includes('runtime error')) {
                            verdictCell.innerText = '런타임 에러';
                            verdictCell.className = 'verdict-rejected';
                        } else if (vt.includes('compilation error')) {
                            verdictCell.innerText = '컴파일 에러';
                            verdictCell.className = 'verdict-rejected';
                        }
                    }

                    // 티어 아이콘
                    if (probColIndex !== -1) {
                        const cell = row.cells[probColIndex]?.querySelector('a');
                        if (cell && !cell.querySelector('img')) {
                            const match = cell.innerText.trim().match(/([0-9]+)([A-Z][0-9]*)/);
                            const rating = match ? probMap[`${match[1]}${match[2]}`] : null;
                            const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(rating));
                            cell.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon" style="width:16px; vertical-align:middle; margin-right:4px;">` + cell.innerHTML;
                        }
                    }
                });
            };

            await transformTable();
            window.BOJ_CF.DOMObserver.init('.status-frame-datatable, table.datatable, .roundbox');
            window.BOJ_CF.DOMObserver.subscribe(() => { cleanup(); transformTable(); });
        }
    };
})();