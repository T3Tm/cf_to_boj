/**
 * src/pages/problem.js (v3.3.1)
 * 개별 문제 페이지 컨트롤러 (중복 변수 제거 및 3차 검토 완료)
 */
window.BOJ_CF.Pages.Problem = (function() {
    return {
        init: async function() {
            const ps = document.querySelector('.problem-statement');
            if (!ps || document.querySelector('.page-header')) return;

            // 0. 경로 및 데이터 준비 (1차 선언으로 통합)
            const pathParts = window.location.pathname.split('/');
            const contestId = pathParts[3];
            const problemIndex = pathParts[4];
            const handle = document.querySelector('.boj-header-user')?.innerText.trim();

            const [allProbs, userStatusRes] = await Promise.all([
                window.BOJ_CF.Fetcher.fetchAllProblems(),
                handle ? window.BOJ_CF.Fetcher.fetchUserStatus(handle) : Promise.resolve(null)
            ]);

            // 문제 통계 및 사용자 상태 확인
            const problemStat = allProbs?.problemStatistics?.find(s => s.contestId == contestId && s.index == problemIndex);
            const totalSolved = problemStat ? problemStat.solvedCount : '-';

            const userStatus = userStatusRes?.result || [];
            const mySubs = userStatus.filter(s => s.problem.contestId == contestId && s.problem.index == problemIndex);
            const isSolved = mySubs.some(s => s.verdict === 'OK');
            const isAttempted = mySubs.length > 0;

            // 1. 탭 메뉴 (nav-pills) - 위에서 선언한 변수 재사용
            const tabMenu = document.createElement('ul');
            tabMenu.className = 'nav nav-pills problem-menu';
            tabMenu.innerHTML = `
                <li class="active"><a href="${window.location.href}">문제</a></li>
                <li><a href="/problemset/submit?contestId=${contestId}&problemIndex=${problemIndex}">제출</a></li>
                <li><a href="/problemset/status/${contestId}/problem/${problemIndex}">채점 현황</a></li>
            `;
            ps.parentNode.insertBefore(tabMenu, ps);

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
            const removeArrows = () => {
                const elements = document.querySelectorAll('.breadcrumb, .side-navigation__item, .lang-chooser');
                elements.forEach(el => {
                    el.childNodes.forEach(node => {
                        if (node.nodeType === 3) {
                            node.textContent = node.textContent.replace(/[»>]/g, '').trim();
                        }
                    });
                });
            };
            removeArrows();

            // [유틸] 섹션 포맷팅
            const formatSection = (selector, titleKOR) => {
                const el = ps.querySelector(selector);
                if (el) {
                    el.querySelector('.section-title').style.display = 'none';
                    const headline = document.createElement('div');
                    headline.className = 'headline';
                    headline.innerHTML = `<h2>${titleKOR}</h2>`;
                    el.insertBefore(headline, el.firstChild);
                    el.className = 'problem-section';
                    const contentWrapper = document.createElement('div');
                    contentWrapper.className = 'problem-text';
                    while (el.childNodes.length > 2) contentWrapper.appendChild(el.childNodes[2]);
                    el.appendChild(contentWrapper);
                }
            };

            // 3. 본문 추출
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

            // 4. 예제 (복사 버튼)
            const sampleTests = ps.querySelector('.sample-tests');
            if (sampleTests) {
                sampleTests.querySelector('.section-title').style.display = 'none';
                const sampleWrapper = document.createElement('div');
                sampleWrapper.className = 'row sample-wrapper';
                const inputs = sampleTests.querySelectorAll('.input');
                const outputs = sampleTests.querySelectorAll('.output');
                
                for (let i = 0; i < inputs.length; i++) {
                    const inText = inputs[i].querySelector('pre').innerText;
                    const outText = outputs[i] ? outputs[i].querySelector('pre').innerText : '';
                    const row = document.createElement('div');
                    row.className = 'row boj-sample-row';
                    row.innerHTML = `
                        <div class="col-md-6">
                            <section id="sampleinput${i+1}" class="problem-section">
                                <div class="headline" style="display: flex; justify-content: space-between; align-items: center;">
                                    <h2 style="margin:0;">예제 입력 ${i+1}</h2>
                                    <button class="btn-copy-sample" data-clipboard-target="#sample-input-${i+1}">복사</button>
                                </div>
                                <pre class="sampledata" id="sample-input-${i+1}">${inText}</pre>
                            </section>
                        </div>
                        <div class="col-md-6">
                            <section id="sampleoutput${i+1}" class="problem-section">
                                <div class="headline" style="display: flex; justify-content: space-between; align-items: center;">
                                    <h2 style="margin:0;">예제 출력 ${i+1}</h2>
                                    <button class="btn-copy-sample" data-clipboard-target="#sample-output-${i+1}">복사</button>
                                </div>
                                <pre class="sampledata" id="sample-output-${i+1}">${outText}</pre>
                            </section>
                        </div>
                    `;
                    sampleWrapper.appendChild(row);
                }
                sampleTests.parentNode.replaceChild(sampleWrapper, sampleTests);

                ps.addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-copy-sample')) {
                        const targetSelector = e.target.getAttribute('data-clipboard-target');
                        const targetNode = ps.querySelector(targetSelector);
                        if (targetNode) navigator.clipboard.writeText(targetNode.innerText);
                    }
                });
            }

            // 5. 알고리즘 분류 (백준 스타일 보기/가리기 버튼 - 호버 효과 제거)
            const tags = Array.from(document.querySelectorAll('.tag-box')).map(t => t.innerText.trim());
            if (tags.length > 0) {
                const tagSection = document.createElement('div');
                tagSection.className = 'col-md-12';
                tagSection.innerHTML = `
                    <section id="problem_tags" class="problem-section" style="margin-top: 20px;">
                        <div class="headline" style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                            <h2 style="font-size: 20px;">알고리즘 분류</h2>
                            <span id="boj-btn-show-tags" style="font-size: 13px; color: #0076c0; cursor: pointer; user-select: none;">${isSolved ? '가리기' : '보기'}</span>
                        </div>
                        <div id="boj-tag-container" style="display: ${isSolved ? 'block' : 'none'}; padding-top: 10px;">
                            <div class="boj-selected-pills" style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${tags.map(t => `<span class="boj-pill" style="cursor:default;">${t}</span>`).join('')}
                            </div>
                        </div>
                    </section>
                `;
                ps.appendChild(tagSection);

                document.getElementById('boj-btn-show-tags').addEventListener('click', function() {
                    const container = document.getElementById('boj-tag-container');
                    const isVisible = container.style.display === 'block';
                    container.style.display = isVisible ? 'none' : 'block';
                    this.innerText = isVisible ? '보기' : '가리기';
                });
            }
        }
    };
})();