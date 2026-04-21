/**
 * src/pages/status.js (v3.4.3)
 * 채점 현황 컨트롤러 (전체 vs 문제별 필터링 이원화 및 BOJ 스타일 필터/테이블 적용)
 */
window.BOJ_CF.Pages.Status = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // 1. URL 파라미터 및 상태 분석
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const index = params.get('index');
            const handleParam = params.get('handle');
            const friendsParam = params.get('friends');
            
            const isProblemStatus = !!(contestId && index);
            const myHandle = document.querySelector('.boj-header-user')?.innerText.trim();
            const isLoggedIn = !!myHandle && myHandle !== 'Unknown';

            // 2. 불필요한 원본 요소 제거 (My only, Friends only 등)
            const cleanupNativeElements = () => {
                // 상단 필터 메뉴 및 원본 탭 제거
                const nativeMenus = document.querySelectorAll('.second-level-menu, .nav-links, .info-bar');
                nativeMenus.forEach(el => el.remove());

                // "My only", "Friends only" 등 텍스트 링크 제거
                document.querySelectorAll('a').forEach(a => {
                    const txt = a.innerText.toLowerCase();
                    if (txt.includes('my only') || txt.includes('friends only')) {
                        a.parentElement.remove(); // 보통 li나 span에 감싸져 있음
                    }
                });
            };
            cleanupNativeElements();

            // 3. 탭 메뉴 제어
            const manageTabMenu = () => {
                let tabMenu = document.querySelector('.problem-menu');
                if (isProblemStatus) {
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

            // 4. 백준 스타일 헤더 및 필터 폼 주입
            const injectHeaderAndFilters = () => {
                let statusHeader = document.getElementById('boj-status-header');
                if (!statusHeader) {
                    statusHeader = document.createElement('div');
                    statusHeader.id = 'boj-status-header';
                    statusHeader.className = 'page-header';
                    
                    const title = isProblemStatus ? `${contestId}${index}번 채점 현황` : '채점 현황';
                    statusHeader.innerHTML = `<h1 style="text-align: left;">${title}</h1>`;
                    
                    const tabMenu = document.querySelector('.problem-menu');
                    if (tabMenu) tabMenu.insertAdjacentElement('afterend', statusHeader);
                    else pc.insertBefore(statusHeader, pc.firstChild);

                    // 필터 폼 (연속적인 동작 보장)
                    const filterForm = document.createElement('div');
                    filterForm.className = 'boj-status-filter';
                    filterForm.style.cssText = 'margin-bottom: 20px; padding: 15px; background: var(--boj-table-stripe); border-radius: 4px; display: flex; gap: 20px; align-items: center; border: 1px solid var(--boj-border);';
                    
                    const myChecked = isLoggedIn && handleParam === myHandle ? 'checked' : '';
                    const followChecked = isLoggedIn && friendsParam === 'on' ? 'checked' : '';
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

                    // 체크박스 이벤트
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
            injectHeaderAndFilters();

            // 5. 테이블 변환 (헤더 번역, 결과 색상, 티어 아이콘)
            const transformTable = async () => {
                // 테이블 가시성 강제 확보 (CSS rule 대응)
                const table = document.querySelector('.status-frame-datatable table') || document.querySelector('.datatable table');
                if (!table) return;

                // (1) 헤더 번역
                const headerMap = {
                    '#': '제출 번호', 'Who': '아이디', 'Problem': '문제', 'Verdict': '결과',
                    'Memory': '메모리', 'Time': '시간', 'Lang': '언어', 'When': '제출 시간'
                };
                const headers = Array.from(table.querySelectorAll('th'));
                headers.forEach(th => {
                    const text = th.innerText.trim();
                    if (headerMap[text]) th.innerText = headerMap[text];
                });

                // (2) 데이터 행 처리
                const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
                const probMap = {};
                if (allProbs) {
                    allProbs.forEach(p => { probMap[`${p.contestId}${p.index}`] = p.rating; });
                }

                const probColIndex = headers.findIndex(th => th.innerText.includes('문제'));

                table.querySelectorAll('tr[data-submission-id]').forEach(row => {
                    const verdictCell = row.querySelector('.verdict-accepted, .verdict-rejected, .verdict-waiting');
                    if (verdictCell) {
                        if (verdictCell.classList.contains('verdict-accepted')) {
                            verdictCell.style.color = '#009874';
                            verdictCell.style.fontWeight = 'bold';
                        } else if (verdictCell.classList.contains('verdict-rejected')) {
                            verdictCell.style.color = '#dd4124';
                        }
                    }

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

            await transformTable();
            window.BOJ_CF.DOMObserver.init('.status-frame-datatable');
            window.BOJ_CF.DOMObserver.subscribe(transformTable);
        }
    };
})();