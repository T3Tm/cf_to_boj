/**
 * scripts/problem.js
 * 문제 상세 페이지 변환 및 데이터 연동
 */
function transformProblemPage() {
    document.querySelectorAll('#header, .menu-box, #sidebar, #footer, .second-level-menu, #pageContent').forEach(el => {
        if(el) el.style.display = 'none';
    });

    const parts = window.location.pathname.split('/').filter(Boolean);
    let contestId = parts.find(p => !isNaN(p) && p.trim() !== '') || "";
    let probIdRaw = Utils.getProblemId();
    let fullProbId = contestId + probIdRaw;

    let solvedCount = localStorage.getItem('boj_solved_' + fullProbId);
    if (!solvedCount) {
        const solvedByLink = document.querySelector('a[href*="/status/"][title*="solved"]');
        solvedCount = solvedByLink ? solvedByLink.innerText.replace(/[^0-9]/g, '').trim() : "0";
    }

    const data = {
        title: document.querySelector('.problem-statement .header .title')?.innerText || "제목 없음",
        timeLimit: (document.querySelector('.problem-statement .header .time-limit')?.innerText || "").split('\n')[1] || "1초",
        memoryLimit: (document.querySelector('.problem-statement .header .memory-limit')?.innerText || "").split('\n')[1] || "256MB",
        problemBody: document.querySelector('.problem-statement > div:nth-child(2)')?.innerHTML || "",
        inputDesc: document.querySelector('.problem-statement .input-specification')?.innerHTML.replace(/<div class="section-title">.*?<\/div>/, '') || "",
        outputDesc: document.querySelector('.problem-statement .output-specification')?.innerHTML.replace(/<div class="section-title">.*?<\/div>/, '') || "",
        inputEx: document.querySelector('.input pre')?.innerText || "",
        outputEx: document.querySelector('.output pre')?.innerText || "",
        cfRating: 0,
        tags: [] 
    };

    document.querySelectorAll('.tag-box').forEach(tag => {
        const title = tag.getAttribute('title');
        if (title === 'Difficulty') {
            const match = tag.innerText.match(/\d+/);
            if (match) data.cfRating = parseInt(match[0]);
        } else {
            data.tags.push(tag.innerText.trim());
        }
    });

    let tagsHtml = data.tags.map(t => `<span class="boj-tag">${t}</span>`).join('');
    if (data.tags.length === 0) tagsHtml = '<span class="boj-tag" style="background:transparent; padding:0;">분류 없음</span>';

    // 개별 문제 난이도 아이콘 호출
    const iconUrl = chrome.runtime.getURL(Utils.getProblemTierIcon(data.cfRating));
    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');

    bojContainer.innerHTML = UI.generateHeader(probIdRaw, 0, iconUrl, data.title);
    
    const mainContent = document.createElement('div');
    mainContent.classList.add('boj-main-container', 'problem-mode');
    
    mainContent.innerHTML = `
        <table class="boj-info-table">
            <thead><tr><th>시간 제한</th><th>메모리 제한</th><th>제출</th><th>정답</th></tr></thead>
            <tbody><tr><td>${data.timeLimit}</td><td>${data.memoryLimit}</td><td>-</td><td>${solvedCount}</td></tr></tbody>
        </table>
        <div class="boj-section"><h2>문제</h2><div class="boj-text problem-statement">${data.problemBody}</div></div>
        <div class="boj-section"><h2>입력</h2><div class="boj-text problem-statement">${data.inputDesc}</div></div>
        <div class="boj-section"><h2>출력</h2><div class="boj-text problem-statement">${data.outputDesc}</div></div>
        <div class="boj-sample-row">
            <div class="boj-sample-col">
                <h2>예제 입력 1 <span class="copy-btn" id="copyIn1">복사</span></h2><pre class="sample-box" id="preIn1">${data.inputEx}</pre>
            </div>
            <div class="boj-sample-col">
                <h2>예제 출력 1 <span class="copy-btn" id="copyOut1">복사</span></h2><pre class="sample-box" id="preOut1">${data.outputEx}</pre>
            </div>
        </div>
        
        <div class="boj-tags-section">
            <div class="boj-tags-header">
                <h2>알고리즘 분류</h2>
                <button class="boj-tags-toggle" id="toggleTagsBtn">보기</button>
            </div>
            <div class="boj-tags-content" id="tagsContentBox">
                ${tagsHtml}
            </div>
        </div>
    `;

    bojContainer.appendChild(mainContent);
    UI.attachNavigation(bojContainer);

    const pageContent = document.querySelector('#pageContent');
    if (pageContent) {
        pageContent.parentNode.insertBefore(bojContainer, pageContent);
        
        document.getElementById('copyIn1')?.addEventListener('click', () => { navigator.clipboard.writeText(data.inputEx); });
        document.getElementById('copyOut1')?.addEventListener('click', () => { navigator.clipboard.writeText(data.outputEx); });

        const toggleBtn = document.getElementById('toggleTagsBtn');
        const tagsBox = document.getElementById('tagsContentBox');
        if (toggleBtn && tagsBox) {
            toggleBtn.addEventListener('click', () => {
                tagsBox.classList.toggle('boj-show');
                if (tagsBox.classList.contains('boj-show')) {
                    toggleBtn.innerText = '가리기';
                } else {
                    toggleBtn.innerText = '보기';
                }
            });
        }
    }
}