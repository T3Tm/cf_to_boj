/**
 * src/components/spoilerToggle.js
 * 개별 문제 스포일러 방지 UI
 */
window.BOJ_CF.Components.SpoilerToggle = (function() {
    return {
        init: function() {
            const style = document.createElement('style'); style.innerHTML = `.tag-box { display: none !important; }`; document.head.appendChild(style);
            const tags = Array.from(document.querySelectorAll('.tag-box')).filter(t => t.getAttribute('title') !== 'Difficulty').map(t => t.innerText.trim());
            const content = document.querySelector('.problem-statement');
            if (!content || document.getElementById('boj-spoiler-box')) return;
            
            const box = document.createElement('div'); box.id = 'boj-spoiler-box';
            box.innerHTML = `<div class="boj-tags-section"><div class="boj-tags-header"><h3>알고리즘 분류</h3><button id="boj-tag-toggle-btn">보기</button></div><div id="boj-hidden-tags" style="display: none;">${tags.length ? tags.map(t => `<span class="boj-pill">${t}</span>`).join('') : '<span class="boj-pill">분류 없음</span>'}</div></div>`;
            content.appendChild(box);

            document.getElementById('boj-tag-toggle-btn').addEventListener('click', function() {
                const hidden = document.getElementById('boj-hidden-tags');
                if (hidden.style.display === 'none') { hidden.style.display = 'flex'; this.innerText = '가리기'; this.classList.add('active'); } 
                else { hidden.style.display = 'none'; this.innerText = '보기'; this.classList.remove('active'); }
            });
        }
    };
})();