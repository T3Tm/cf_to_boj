/**
 * src/pages/problem.js
 * 개별 문제 페이지 컨트롤러
 */
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Problem = (function() {
    return {
        init: function() {
            const ps = document.querySelector('.problem-statement');
            if (!ps || document.querySelector('.page-header')) return;

            // 1. 탭 메뉴 (nav-pills)
            const hiddenLinks = Array.from(document.querySelectorAll('.second-level-menu a'));
            const submitLink = hiddenLinks.find(a => a.href.includes('/submit'))?.href || '#';
            const statusLink = hiddenLinks.find(a => a.href.includes('/status'))?.href || '#';

            const tabMenu = document.createElement('ul');
            tabMenu.className = 'nav nav-pills problem-menu';
            tabMenu.innerHTML = `
                <li class="active"><a href="${window.location.href}">문제</a></li>
                <li><a href="${submitLink}">제출</a></li>
                <li><a href="${statusLink}">채점 현황</a></li>
            `;
            ps.parentNode.insertBefore(tabMenu, ps);

            // 2. 헤더 및 정보 테이블 (page-header, table)
            const header = ps.querySelector('.header');
            if (header) {
                const rawTitle = header.querySelector('.title')?.innerText || '';
                const titleMatch = rawTitle.match(/([A-Z0-9]+)\.\s*(.+)/);
                const probId = titleMatch ? titleMatch[1] : '';
                const probName = titleMatch ? titleMatch[2] : rawTitle;

                const timeLimit = header.querySelector('.time-limit')?.lastChild?.textContent || '2 초';
                const memLimit = header.querySelector('.memory-limit')?.lastChild?.textContent || '512 MB';

                const infoWrapper = document.createElement('div');
                infoWrapper.innerHTML = `
                    <div class="page-header">
                        <h1><span class="printable">${probId}번 - </span><span id="problem_title">${probName}</span></h1>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="problem-info">
                            <thead><tr><th style="width:25%;">시간 제한</th><th style="width:25%;">메모리 제한</th><th style="width:25%;">제출</th><th style="width:25%;">정답</th></tr></thead>
                            <tbody><tr><td>${timeLimit}</td><td>${memLimit}</td><td>-</td><td>-</td></tr></tbody>
                        </table>
                    </div>
                `;
                ps.insertBefore(infoWrapper, ps.firstChild);
                header.style.display = 'none';
            }

            // [유틸] 섹션을 BOJ Headline + problem-text 구조로 변환
            const formatSection = (selector, titleKOR) => {
                const el = ps.querySelector(selector);
                if (el) {
                    el.querySelector('.section-title').style.display = 'none'; // 기존 타이틀 숨김
                    
                    const headline = document.createElement('div');
                    headline.className = 'headline';
                    headline.innerHTML = `<h2>${titleKOR}</h2>`;
                    el.insertBefore(headline, el.firstChild);
                    
                    el.className = 'problem-section'; // 백준 클래스 부여
                    
                    const contentWrapper = document.createElement('div');
                    contentWrapper.className = 'problem-text';
                    while (el.childNodes.length > 2) {
                        contentWrapper.appendChild(el.childNodes[2]);
                    }
                    el.appendChild(contentWrapper);
                }
            };

            // 3. 본문 (Description) 추출 및 래핑
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

            // 4. 예제 2분할 레이아웃 (col-md-6)
            const sampleTests = ps.querySelector('.sample-tests');
            if (sampleTests) {
                sampleTests.querySelector('.section-title').style.display = 'none';

                const sampleWrapper = document.createElement('div');
                sampleWrapper.className = 'row sample-wrapper';
                
                const inputs = sampleTests.querySelectorAll('.input');
                const outputs = sampleTests.querySelectorAll('.output');
                
                for (let i = 0; i < inputs.length; i++) {
                    const inText = inputs[i].querySelector('pre').innerHTML;
                    const outText = outputs[i] ? outputs[i].querySelector('pre').innerHTML : '';
                    
                    const row = document.createElement('div');
                    row.className = 'row boj-sample-row';
                    row.innerHTML = `
                        <div class="col-md-6">
                            <section id="sampleinput${i+1}" class="problem-section">
                                <div class="headline"><h2>예제 입력 ${i+1}</h2></div>
                                <pre class="sampledata" id="sample-input-${i+1}">${inText}</pre>
                            </section>
                        </div>
                        <div class="col-md-6">
                            <section id="sampleoutput${i+1}" class="problem-section">
                                <div class="headline"><h2>예제 출력 ${i+1}</h2></div>
                                <pre class="sampledata" id="sample-output-${i+1}">${outText}</pre>
                            </section>
                        </div>
                    `;
                    sampleWrapper.appendChild(row);
                }
                sampleTests.parentNode.replaceChild(sampleWrapper, sampleTests);
            }

            // 5. 알고리즘 분류 (태그)
            const tags = Array.from(document.querySelectorAll('.tag-box')).map(t => t.innerText.trim());
            if (tags.length > 0) {
                const tagSection = document.createElement('div');
                tagSection.className = 'col-md-12';
                tagSection.innerHTML = `
                    <section id="problem_tags" class="problem-section">
                        <div class="headline"><h2>알고리즘 분류</h2></div>
                        <div class="spoiler">
                            <ul class="spoiler-list">
                                ${tags.map(t => `<li><a href="#" class="spoiler-link">${t}</a></li>`).join('')}
                            </ul>
                        </div>
                    </section>
                `;
                ps.appendChild(tagSection);
            }
        }
    };
})();