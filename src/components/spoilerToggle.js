/**
 * src/components/spoilerToggle.js
 * 개별 문제 스포일러 방지 UI
 */
window.BOJ_CF.Components.SpoilerToggle = (function() {
    return {
        init: function() {
            const style = document.createElement('style');
            style.innerHTML = `.tag-box { display: none !important; }`;
            document.head.appendChild(style);

            const tags = [];
            document.querySelectorAll('.tag-box').forEach(tag => {
                if (tag.getAttribute('title') !== 'Difficulty') tags.push(tag.innerText.trim());
            });

            const problemContent = document.querySelector('.problem-statement');
            if (!problemContent || document.getElementById('boj-spoiler-box')) return;

            let tagsHtml = tags.length > 0 
                ? tags.map(t => `<span class="boj-pill">${t}</span>`).join('') 
                : '<span class="boj-pill">분류 없음</span>';

            const spoilerBox = document.createElement('div');
            spoilerBox.id = 'boj-spoiler-box';
            spoilerBox.innerHTML = `
                <div class="boj-tags-section">
                    <div class="boj-tags-header">
                        <h3>알고리즘 분류</h3>
                        <button id="boj-tag-toggle-btn">보기</button>
                    </div>
                    <div id="boj-hidden-tags" style="display: none;">${tagsHtml}</div>
                </div>
            `;
            problemContent.appendChild(spoilerBox);

            document.getElementById('boj-tag-toggle-btn').addEventListener('click', function() {
                const hiddenBox = document.getElementById('boj-hidden-tags');
                if (hiddenBox.style.display === 'none') {
                    hiddenBox.style.display = 'flex';
                    this.innerText = '가리기';
                    this.classList.add('active');
                } else {
                    hiddenBox.style.display = 'none';
                    this.innerText = '보기';
                    this.classList.remove('active');
                }
            });
        }
    };
})();