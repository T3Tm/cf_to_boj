/**
 * src/pages/status.js (v3.5.0)
 * 채점 현황 컨트롤러 (전체 vs 문제별 필터링 이원화 및 BOJ 스타일 필터/테이블 적용)
 * 3차 검토 및 안정성 강화 완료
 */
window.BOJ_CF.Pages.Status = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // [검토 1단계] URL 및 상태 분석 무결성 확인
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const index = params.get('index') || params.get('problemIndex');
            
            // 문제 페이지에서 왔는지 여부 판단 (쿼리 스트링 기반)
            const isFromProblem = !!(contestId && index);
            const myHandle = document.querySelector('.boj-header-user')?.innerText.trim();
            const isLoggedIn = !!myHandle && myHandle !== 'Unknown';

            // [검토 2단계] 네이티브 요소 제거 및 UI 초기화
            const cleanupNativeElements = () => {
                // 상단 필터 메뉴, 사이드바 내비게이션 등 불필요한 요소 영구 제거
                const selectors = [
                    '.second-level-menu', '.nav-links', '.info-bar', 
                    '.side-navigation', '.side-navigation__item',
                    '.lang-chooser', '.menu-box'
                ];
                selectors.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));

                // "My only", "Friends only" 등 텍스트 기반 필터 링크 제거
                document.querySelectorAll('a').forEach(a => {
                    const txt = a.innerText.toLowerCase();
                    if (txt.includes('my only') || txt.includes('friends only') || txt.includes('only my') || txt.includes('only friends')) {
                        a.closest('li')?.remove() || a.remove();
                    }
                });
            };
            cleanupNativeElements();

            // 탭 메뉴 제어 (문제에서 온 경우에만 노출)
            const manageTabMenu = () => {
                let tabMenu = document.querySelector('.problem-menu');
                if (isFromProblem) {
                    if (!tabMenu) {
                        tabMenu = document.createElement('ul');
                        tabMenu.className = 'nav nav-pills problem-menu';
                        tabMenu.innerHTML = `
                            <li><a href="/problemset/problem/${contestId}/${index}">문제</a></li>
                            <li><a href="/problemset/submit?contestId=${contestId}&problemIndex=${index}">제출</a></li>
                            <li class="active"><a href="#">채점 현황</a></li>
                        `;
                        pc.insertBefore(tabMenu, pc.firstChild);
                    }
                } else if (tabMenu) {
                    tabMenu.remove();
                }
            };
            manageTabMenu();

            // 헤더 및 필터 주입
            const injectHeader = () => {
                let statusHeader = document.getElementById('boj-status-header');
                if (!statusHeader) {
                    statusHeader = document.createElement('div');
                    statusHeader.id = 'boj-status-header';
                    statusHeader.className = 'page-header';
                    
                    const title = isFromProblem ? `${contestId}${index}번 채점 현황` : '채점 현황';
                    statusHeader.innerHTML = `<h1 style="text-align: left;">${title}</h1>`;
                    
                    const tabMenu = document.querySelector('.problem-menu');
                    if (tabMenu) tabMenu.insertAdjacentElement('afterend', statusHeader);
                    else pc.insertBefore(statusHeader, pc.firstChild);

                    // 필터 폼
                    const filterForm = document.createElement('div');
                    filterForm.className = 'boj-status-filter';
                    filterForm.style.cssText = 'margin-bottom: 20px; padding: 15px; background: var(--boj-table-stripe); border-radius: 4px; display: flex; gap: 20px; align-items: center; border: 1px solid var(--boj-border);';
                    
                    const myChecked = isLoggedIn && params.get('handle') === myHandle ? 'checked' : '';
                    const followChecked = isLoggedIn && params.get('friends') === 'on' ? 'checked' : '';
                    const disabledAttr = !isLoggedIn ? 'disabled title="로그인이 필요합니다"' : '';

                    filterForm.innerHTML = `
                        <label style="display: flex; align-items: center; gap: 6px; cursor: ${isLoggedIn ? 'pointer' : 'not-allowed'}; font-weight: 500; color: var(--boj-text); opacity: ${isLoggedIn ? 1 : 0.5};">
                            <input type="checkbox" id="chk-my-subs" ${myChecked} ${disabledAttr}> 내 제출
                        </label>
                        <label style="display: flex; align-items: center; gap: 6px; cursor: ${isLoggedIn ? 'pointer' : 'not-allowed'}; font-weight: 500; color: var(--boj-text); opacity: ${isLoggedIn ? 1 : 0.5};">
                            <input type="checkbox" id="chk-follow-subs" ${followChecked} ${disabledAttr}> 팔로우 제출
                        </label>
                    `;
                    statusHeader.insertAdjacentElement('afterend', filterForm);

                    if (isLoggedIn) {
                        document.getElementById('chk-my-subs').addEventListener('change', (e) => {
                            const newParams = new URLSearchParams(window.location.search);
                            if (e.target.checked) newParams.set('handle', myHandle);
                            else newParams.delete('handle');
                            window.location.search = newParams.toString();
                        });
                        document.getElementById('chk-follow-subs').addEventListener('change', (e) => {
                            const newParams = new URLSearchParams(window.location.search);
                            if (e.target.checked) newParams.set('friends', 'on');
                            else newParams.delete('friends');
                            window.location.search = newParams.toString();
                        });
                    }
                }
            };
            injectHeader();

            // [검토 3단계] 테이블 데이터 변환 및 안정성 확보
            const transformTable = async () => {
                // 다양한 테이블 형태에 대응하는 안정적인 선택자
                const table = document.querySelector('table.status-frame-datatable') || 
                              document.querySelector('.status-frame-datatable table') || 
                              document.querySelector('table.datatable') ||
                              document.querySelector('.datatable table');
                
                if (!table) return;

                // CSS display:none 공격 방어 및 가시성 확보
                table.style.display = 'table';
                let current = table.parentElement;
                while (current && current !== pc) {
                    if (current.classList.contains('datatable') || current.classList.contains('status-frame-datatable')) {
                        current.style.display = 'block';
                    }
                    current = current.parentElement;
                }

                // 헤더 번역
                const headerMap = {
                    '#': '제출 번호', 'Who': '아이디', 'Problem': '문제', 'Verdict': '결과',
                    'Memory': '메모리', 'Time': '시간', 'Lang': '언어', 'When': '제출 시간',
                    'Sent': '제출 시간', 'Submit Time': '제출 시간'
                };
                const headers = Array.from(table.querySelectorAll('th'));
                headers.forEach(th => {
                    const text = th.innerText.trim();
                    for (const [key, val] of Object.entries(headerMap)) {
                        if (text.startsWith(key)) {
                            th.innerText = val;
                            break;
                        }
                    }
                });

                // 데이터 로드 및 렌더링
                const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
                const probMap = {};
                if (allProbs) {
                    allProbs.forEach(p => { probMap[`${p.contestId}${p.index}`] = p.rating; });
                }

                const probColIndex = headers.findIndex(th => th.innerText.includes('문제'));

                table.querySelectorAll('tr[data-submission-id], tr[submissionid]').forEach(row => {
                    // 결과 색상 적용 (BOJ 스타일)
                    const verdictCell = row.querySelector('.verdict-accepted, .verdict-rejected, .verdict-waiting, [class*="verdict"]');
                    if (verdictCell) {
                        const txt = verdictCell.innerText.toLowerCase();
                        if (txt.includes('accepted') || verdictCell.classList.contains('verdict-accepted')) {
                            verdictCell.style.color = '#009874';
                            verdictCell.style.fontWeight = 'bold';
                        } else if (txt.includes('wrong') || txt.includes('rejected') || txt.includes('error') || txt.includes('failed')) {
                            verdictCell.style.color = '#dd4124';
                        }
                    }

                    // 티어 아이콘 주입
                    if (probColIndex !== -1) {
                        const problemCell = row.cells[probColIndex]?.querySelector('a');
                        if (problemCell && !problemCell.querySelector('img')) {
                            const rawText = problemCell.innerText.trim();
                            const match = rawText.match(/([0-9]+)([A-Z][0-9]*)/);
                            const rating = match ? probMap[`${match[1]}${match[2]}`] : null;
                            const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(rating));
                            problemCell.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon" style="width:16px; vertical-align:middle; margin-right:4px;">` + problemCell.innerHTML;
                        }
                    }
                });
            };

            // 초기 실행 및 옵저버 등록
            await transformTable();
            window.BOJ_CF.DOMObserver.init('.status-frame-datatable, table.datatable');
            window.BOJ_CF.DOMObserver.subscribe(transformTable);
        }
    };
})();