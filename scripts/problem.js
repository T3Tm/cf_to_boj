/**
 * scripts/problem.js
 * 개별 문제 페이지 (태그 스포일러 방지 로직 탑재)
 */
function transformProblemPage() {
    document.querySelectorAll('#header, .menu-box, #sidebar, #footer, .second-level-menu').forEach(el => {
        if(el) el.style.display = 'none';
    });

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

    // 태그 데이터 수집 후 원본 DOM 강제 숨김 (스포일러 차단)
    document.querySelectorAll('.tag-box').forEach(tag => {
        const title = tag.getAttribute('title');
        if (title === 'Difficulty') {
            const match = tag.innerText.match(/\d+/);
            if (match) data.cfRating = parseInt(match[0]);
        } else {
            data.tags.push(tag.innerText.trim());
        }
        tag.style.display = 'none'; // 영구 숨김
    });

    let tagsHtml = data.tags.map(t => `<span class="boj-tag">${t}</span>`).join('');
    if (data.tags.length === 0) tagsHtml = '<span class="boj-tag" style="background:transparent; padding:0;">분류 없음</span>';

    const iconUrl = chrome.runtime.getURL(Utils.getProblemTierIcon(data.cfRating));
    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');

    bojContainer.innerHTML = UI.generateHeader(Utils.getProblemId(), 0, iconUrl, data.title);
    
    const mainContent = document.createElement('div');
    mainContent.classList.add('boj-main-container', 'problem-mode');
    
    // [신규] 백준 스타일 태그 스포일러 방지 박스 생성
    mainContent.innerHTML = `
        <table class="boj-info-table">
            <thead><tr><th>시간 제한</th><th>메모리 제한</th></tr></thead>
            <tbody><tr><td>${data.timeLimit}</td><td>${data.memoryLimit}</td></tr></tbody>
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
        
        <div class="boj-tags-section" style="margin-top: 40px; border: 1px solid #ddd; padding: 20px; border-radius: 4px; background: var(--boj-bg-light, #f9f9f9);">
            <div class="boj-tags-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 16px;">알고리즘 분류</h2>
                <button class="boj-tags-toggle" id="toggleTagsBtn" style="padding: 5px 15px; cursor: pointer; background: #fff; border: 1px solid #ccc; border-radius: 4px;">보기</button>
            </div>
            <div class="boj-tags-content" id="tagsContentBox" style="display: none; margin-top: 15px;">
                ${tagsHtml}
            </div>
        </div>
    `;

    bojContainer.appendChild(mainContent);
    UI.attachNavigation(bojContainer);

    const pageContent = document.querySelector('#pageContent');
    if (pageContent) {
        pageContent.parentNode.insertBefore(bojContainer, pageContent);
        pageContent.style.display = 'none'; // 기존 화면 날림
        
        document.getElementById('copyIn1')?.addEventListener('click', () => navigator.clipboard.writeText(data.inputEx));
        document.getElementById('copyOut1')?.addEventListener('click', () => navigator.clipboard.writeText(data.outputEx));

        // 토글 버튼 이벤트
        const toggleBtn = document.getElementById('toggleTagsBtn');
        const tagsBox = document.getElementById('tagsContentBox');
        if (toggleBtn && tagsBox) {
            toggleBtn.addEventListener('click', () => {
                if (tagsBox.style.display === 'none') {
                    tagsBox.style.display = 'block';
                    toggleBtn.innerText = '가리기';
                } else {
                    tagsBox.style.display = 'none';
                    toggleBtn.innerText = '보기';
                }
            });
        }
    }
}