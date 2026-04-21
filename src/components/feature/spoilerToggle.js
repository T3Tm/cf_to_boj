/**
 * src/components/feature/spoilerToggle.js (v4.0.0)
 * [Atomic Design] 기능성 컴포넌트 - 알고리즘 분류 스포일러 방지 토글
 */
window.BOJ_CF.Components.SpoilerToggle = (function() {
    /**
     * 태그 섹션의 가시성을 토글합니다.
     */
    function toggleTags() {
        const tagsContainer = document.getElementById('boj-spoiler-tags-list');
        const toggleBtn = document.getElementById('boj-spoiler-toggle-btn');
        if (!tagsContainer || !toggleBtn) return;

        const isHidden = tagsContainer.style.display === 'none';
        if (isHidden) {
            tagsContainer.style.display = 'flex';
            toggleBtn.innerText = '가리기';
            toggleBtn.classList.add('active');
        } else {
            tagsContainer.style.display = 'none';
            toggleBtn.innerText = '보기';
            toggleBtn.classList.remove('active');
        }
    }

    return {
        /**
         * 스포일러 방지 박스를 렌더링하고 이벤트를 바인딩합니다.
         * @param {HTMLElement} rootElement 주입될 부모 요소
         * @param {Array<string>} tags 표시할 태그 목록
         */
        render: function(rootElement, tags = []) {
            if (!rootElement || document.getElementById('boj-spoiler-box')) return;

            const spoilerBox = document.createElement('div');
            spoilerBox.id = 'boj-spoiler-box';
            spoilerBox.className = 'boj-spoiler-container';

            const tagsHtml = tags.length > 0 
                ? tags.map(tag => `<span class="boj-pill">${tag}</span>`).join('')
                : '<span class="boj-pill empty">분류 없음</span>';

            spoilerBox.innerHTML = `
                <div class="boj-spoiler-header">
                    <h3 class="boj-spoiler-title">알고리즘 분류</h3>
                    <button id="boj-spoiler-toggle-btn" class="boj-spoiler-btn">보기</button>
                </div>
                <div id="boj-spoiler-tags-list" class="boj-spoiler-tags" style="display: none;">
                    ${tagsHtml}
                </div>
            `;

            rootElement.appendChild(spoilerBox);
            this.bindEvents();
            console.log("[BOJ_CF] SpoilerToggle rendered.");
        },

        /**
         * 토글 버튼 이벤트를 바인딩합니다.
         */
        bindEvents: function() {
            const btn = document.getElementById('boj-spoiler-toggle-btn');
            if (btn) {
                btn.addEventListener('click', toggleTags);
            }
        }
    };
})();