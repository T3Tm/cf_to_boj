/**
 * src/components/spoilerToggle.js
 * 개별 문제 페이지의 태그 스포일러 방지 UI 컴포넌트
 */
window.BOJ_CF.Components.SpoilerToggle = (function() {
    return {
        init: function() {
            // 1. 기존 태그 박스 강제 숨김 처리 (CSS 주입)
            const style = document.createElement('style');
            style.innerHTML = `.tag-box { display: none !important; }`;
            document.head.appendChild(style);

            // 2. 기존 태그 데이터 수집
            const tags = [];
            document.querySelectorAll('.tag-box').forEach(tag => {
                const title = tag.getAttribute('title');
                if (title !== 'Difficulty') tags.push(tag.innerText.trim());
            });

            const problemContent = document.querySelector('.problem-statement');
            if (!problemContent || document.getElementById('boj-spoiler-box')) return;

            let tagsHtml = tags.length > 0 
                ? tags.map(t => `<span class="boj-pill">${t}</span>`).join('') 
                : '<span class="boj-pill">분류 없음</span>';

            // 3. 스포일러 방지 박스 생성 및 주입
            const spoilerBox = document.createElement('div');
            spoilerBox.id = 'boj-spoiler-box';
            spoilerBox.innerHTML = `
                <div class="boj-tags-section" style="margin-top: 40px; padding: 15px; border: 1px solid var(--boj-border); border-radius: 4px; background: var(--boj-bg);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: var(--boj-text); font-size: 16px;">알고리즘 분류</h3>
                        <button id="boj-tag-toggle-btn" style="padding: 5px 15px; background: #0076c0; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">보기</button>
                    </div>
                    <div id="boj-hidden-tags" style="display: none; margin-top: 15px; gap: 8px; flex-wrap: wrap;">${tagsHtml}</div>
                </div>
            `;
            problemContent.appendChild(spoilerBox);

            // 4. 토글 애니메이션/이벤트
            document.getElementById('boj-tag-toggle-btn').addEventListener('click', function() {
                const hiddenBox = document.getElementById('boj-hidden-tags');
                if (hiddenBox.style.display === 'none') {
                    hiddenBox.style.display = 'flex';
                    this.innerText = '가리기';
                    this.style.background = '#666';
                } else {
                    hiddenBox.style.display = 'none';
                    this.innerText = '보기';
                    this.style.background = '#0076c0';
                }
            });
        }
    };
})();