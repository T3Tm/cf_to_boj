/**
 * src/pages/status.js (v3.3.0)
 * 채점 현황 컨트롤러 (전체 vs 문제별 필터링 이원화 및 탭 바 유지)
 */
window.BOJ_CF.Pages.Status = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // 1. URL 파라미터 분석
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const index = params.get('index');
            const isFiltered = contestId && index;

            // 2. 탭 메뉴 주입 (문제 필터링 시에만)
            if (isFiltered) {
                let tabMenu = document.querySelector('.problem-menu');
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
            }

            // 3. 백준 스타일 헤더 주입
            let statusHeader = document.getElementById('boj-status-header');
            if (!statusHeader) {
                statusHeader = document.createElement('div');
                statusHeader.id = 'boj-status-header';
                statusHeader.className = 'page-header';
                statusHeader.style.marginBottom = '20px';
                
                const title = isFiltered ? `${contestId}${index}번 채점 현황` : '모든 유저의 채점 현황';
                statusHeader.innerHTML = `<h1 style="font-size: 28px; text-align: left;">${title}</h1>`;
                
                // 탭 메뉴가 있으면 그 뒤에, 없으면 맨 앞에 삽입
                const tabMenu = document.querySelector('.problem-menu');
                if (tabMenu) tabMenu.insertAdjacentElement('afterend', statusHeader);
                else pc.insertBefore(statusHeader, pc.firstChild);
            }

            // 4. 티어 아이콘 렌더링
            const renderTiers = async () => {
                const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
                const probMap = {};
                if (allProbs) {
                    allProbs.forEach(p => { probMap[`${p.contestId}${p.index}`] = p.rating; });
                }

                document.querySelectorAll('.status-frame-datatable tr[data-submission-id]').forEach(row => {
                    const problemCell = row.querySelector('td:nth-child(3) a');
                    if (problemCell && !problemCell.querySelector('img')) {
                        const rawText = problemCell.innerText.trim();
                        const match = rawText.match(/([0-9]+)([A-Z][0-9]*)/);
                        const rating = match ? probMap[`${match[1]}${match[2]}`] : null;
                        const iconUrl = chrome.runtime.getURL(window.BOJ_CF.TierCalculator.getProblemTierIcon(rating));
                        problemCell.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon" style="width:16px; vertical-align:middle; margin-right:4px;">` + problemCell.innerHTML;
                    }
                });
            };

            renderTiers();
            window.BOJ_CF.DOMObserver.init('.status-frame-datatable');
            window.BOJ_CF.DOMObserver.subscribe(renderTiers);
        }
    };
})();