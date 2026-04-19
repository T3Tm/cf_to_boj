/**
 * scripts/problem.js
 */
function transformProblemPage() {
    // 사이드바의 기본 태그 강제 숨김 (CSS로 차단)
    const style = document.createElement('style');
    style.innerHTML = `.tag-box { display: none !important; }`;
    document.head.appendChild(style);

    const tags = [];
    document.querySelectorAll('.tag-box').forEach(tag => {
        const title = tag.getAttribute('title');
        if (title !== 'Difficulty') tags.push(tag.innerText.trim());
    });

    let tagsHtml = tags.length > 0 ? tags.map(t => `<span class="boj-pill">${t}</span>`).join('') : '분류 없음';

    // 지문 하단에 스포일러 방지 UI 주입
    const problemContent = document.querySelector('.problem-statement');
    if(problemContent) {
        const spoilerBox = document.createElement('div');
        spoilerBox.innerHTML = `
            <div style="margin-top: 40px; padding: 15px; border: 1px solid var(--boj-border); border-radius: 4px; background: var(--boj-bg);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: var(--boj-text);">알고리즘 분류</h3>
                    <button id="boj-tag-toggle-btn" style="padding: 5px 15px; background: #0076c0; color: #fff; border: none; border-radius: 4px; cursor: pointer;">보기</button>
                </div>
                <div id="boj-hidden-tags" style="display: none; margin-top: 15px; gap: 8px; flex-wrap: wrap;">${tagsHtml}</div>
            </div>
        `;
        problemContent.appendChild(spoilerBox);

        document.getElementById('boj-tag-toggle-btn').addEventListener('click', function() {
            const hiddenBox = document.getElementById('boj-hidden-tags');
            if(hiddenBox.style.display === 'none') {
                hiddenBox.style.display = 'flex';
                this.innerText = '가리기';
            } else {
                hiddenBox.style.display = 'none';
                this.innerText = '보기';
            }
        });
    }
}