/**
 * src/pages/problem.js (v4.0.0)
 * [UI Refinement] 개별 문제 페이지 컨트롤러 (탭 메뉴 정렬 및 태그 복구)
 */
window.BOJ_CF.Pages.Problem = (function() {
    return {
        init: async function() {
            const ps = document.querySelector('.problem-statement');
            if (!ps || document.querySelector('.page-header')) return;

            // 0. 경로 및 데이터 준비
            const pathParts = window.location.pathname.split('/');
            const contestId = pathParts[3];
            const problemIndex = pathParts[4];
            const handle = document.querySelector('.boj-header-user')?.innerText.trim();

            const [allProbs, userStatusRes] = await Promise.all([
                window.BOJ_CF.Fetcher.fetchAllProblems(),
                handle ? window.BOJ_CF.Fetcher.fetchUserStatus(handle) : Promise.resolve(null)
            ]);

            // [수정] 객체 구조에 맞춰 problemStatistics에서 검색
            const problemStat = allProbs?.problemStatistics?.find(s => s.contestId == contestId && s.index == problemIndex);
            const totalSolved = problemStat ? problemStat.solvedCount : '-';

            const userStatus = userStatusRes?.result || [];
            const mySubs = userStatus.filter(s => s.problem.contestId == contestId && s.problem.index == problemIndex);
            const isSolved = mySubs.some(s => s.verdict === 'OK');
            const isAttempted = mySubs.length > 0;

            // 1. 탭 메뉴 (nav-tabs - BOJ 오리지널 스타일)
            const tabMenu = document.createElement('ul');
            tabMenu.className = 'nav nav-tabs problem-menu';
            tabMenu.innerHTML = `
                <li class="active"><a href="${window.location.href}">문제</a></li>
                <li><a href="/problemset/submit?contestId=${contestId}&problemIndex=${problemIndex}">제출</a></li>
                <li><a href="/problemset/status/${contestId}/problem/${problemIndex}">채점 현황</a></li>
            `;
            const pc = document.querySelector('#pageContent');
            if (pc) pc.insertBefore(tabMenu, pc.firstChild);

            // 2. 헤더 및 정보 테이블
            const header = ps.querySelector('.header');
            if (header) {
                const rawTitle = header.querySelector('.title')?.innerText || '';
                const titleMatch = rawTitle.match(/([A-Z0-9]+)\.\s*(.+)/);
                const probId = titleMatch ? titleMatch[1] : '';
                const probName = titleMatch ? titleMatch[2] : rawTitle;

                const timeLimit = header.querySelector('.time-limit')?.lastChild?.textContent || '2 초';
                const memLimit = header.querySelector('.memory-limit')?.lastChild?.textContent || '512 MB';

                let statusBadge = '';
                if (isSolved) statusBadge = '<span class="boj-label label-success" style="margin-left:10px; font-size:14px; vertical-align:middle; padding:4px 8px; border-radius:4px; background:#009874; color:#fff;">성공</span>';
                else if (isAttempted) statusBadge = '<span class="boj-label label-danger" style="margin-left:10px; font-size:14px; vertical-align:middle; padding:4px 8px; border-radius:4px; background:#dd4124; color:#fff;">실패</span>';

                const infoWrapper = document.createElement('div');
                infoWrapper.innerHTML = `
                    <div class="page-header">
                        <h1 style="text-align: left;"><span class="printable">${probId}번 - </span><span id="problem_title">${probName}</span>${statusBadge}</h1>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="problem-info">
                            <thead><tr><th style="width:25%; text-align: center;">시간 제한</th><th style="width:25%; text-align: center;">메모리 제한</th><th style="width:25%; text-align: center;">제출</th><th style="width:25%; text-align: center;">정답</th></tr></thead>
                            <tbody><tr><td style="text-align: center;">${timeLimit}</td><td style="text-align: center;">${memLimit}</td><td style="text-align: center;">-</td><td style="text-align: center;">${totalSolved}</td></tr></tbody>
                        </table>
                    </div>
                `;
                ps.insertBefore(infoWrapper, ps.firstChild);
                header.style.display = 'none';
            }

            // 모든 '>' 또는 '»' 기호 정밀 제거
            const elements = document.querySelectorAll('.breadcrumb, .side-navigation__item, .lang-chooser');
            elements.forEach(el => {
                el.childNodes.forEach(node => {
                    if (node.nodeType === 3) node.textContent = node.textContent.replace(/[»>]/g, '').trim();
                });
            });

            // 섹션 포맷팅 유틸
            const formatSection = (selector, titleKOR) => {
                const el = ps.querySelector(selector);
                if (el) {
                    const titleEl = el.querySelector('.section-title');
                    if (titleEl) titleEl.style.display = 'none';
                    const headline = document.createElement('div');
                    headline.className = 'headline';
                    headline.innerHTML = `<h2>${titleKOR}</h2>`;
                    el.insertBefore(headline, el.firstChild);
                    el.className = 'problem-section';
                }
            };

            // 3. 본문 추출 및 정돈
            const inputSpec = ps.querySelector('.input-specification');
            const descWrapper = document.createElement('section');
            descWrapper.id = 'description';
            descWrapper.className = 'problem-section';
            descWrapper.innerHTML = `<div class="headline"><h2>문제</h2></div><div class="problem-text"></div>`;
            
            let currNode = header ? header.nextSibling : ps.firstChild;
            const descText = descWrapper.querySelector('.problem-text');
            while (currNode && currNode !== inputSpec) {
                const next = currNode.nextSibling;
                if (currNode.tagName && !currNode.classList.contains('page-header') && !currNode.classList.contains('table-responsive')) {
                   descText.appendChild(currNode);
                }
                currNode = next;
            }
            ps.insertBefore(descWrapper, inputSpec);

            formatSection('.input-specification', '입력');
            formatSection('.output-specification', '출력');
            formatSection('.note', '힌트');

            // 4. 예제 (2분할 레이아웃)
            const sampleTests = ps.querySelector('.sample-tests');
            if (sampleTests) {
                const inputs = sampleTests.querySelectorAll('.input');
                const outputs = sampleTests.querySelectorAll('.output');
                const sampleWrapper = document.createElement('div');
                sampleWrapper.className = 'row sample-wrapper';
                
                for (let i = 0; i < inputs.length; i++) {
                    const inText = inputs[i].querySelector('pre').innerText;
                    const outText = outputs[i] ? outputs[i].querySelector('pre').innerText : '';
                    const row = document.createElement('div');
                    row.className = 'boj-sample-row';
                    row.style.display = 'flex';
                    row.style.gap = '20px';
                    row.style.marginBottom = '20px';
                    row.innerHTML = `
                        <div style="flex:1;">
                            <section class="problem-section">
                                <div class="headline" style="display: flex; justify-content: space-between; align-items: center;">
                                    <h2 style="margin:0;">예제 입력 ${i+1}</h2>
                                    <button class="btn-copy-sample" data-target="in-${i}">복사</button>
                                </div>
                                <pre class="sampledata" id="in-${i}">${inText}</pre>
                            </section>
                        </div>
                        <div style="flex:1;">
                            <section class="problem-section">
                                <div class="headline" style="display: flex; justify-content: space-between; align-items: center;">
                                    <h2 style="margin:0;">예제 출력 ${i+1}</h2>
                                    <button class="btn-copy-sample" data-target="out-${i}">복사</button>
                                </div>
                                <pre class="sampledata" id="out-${i}">${outText}</pre>
                            </section>
                        </div>
                    `;
                    sampleWrapper.appendChild(row);
                }
                sampleTests.parentNode.replaceChild(sampleWrapper, sampleTests);

                ps.addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-copy-sample')) {
                        const id = e.target.getAttribute('data-target');
                        const text = document.getElementById(id)?.innerText;
                        if (text) navigator.clipboard.writeText(text);
                    }
                });
            }

            // 5. 알고리즘 분류 복구 (강화된 추출 로직)
            const sidebarTags = Array.from(document.querySelectorAll('.tag-box'))
                .filter(t => t.getAttribute('title') !== 'Difficulty')
                .map(t => t.innerText.trim());
            
            const uniqueTags = [...new Set(sidebarTags)];
            if (uniqueTags.length > 0) {
                window.BOJ_CF.Components.SpoilerToggle.render(ps, uniqueTags);
            }
        }
    };
})();