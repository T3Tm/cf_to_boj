/**
 * src/pages/problem.js
 * 개별 문제 페이지 컨트롤러
 */
window.BOJ_CF.Pages.Problem = (function() {
    return {
        init: function() {
            window.BOJ_CF.Components.SpoilerToggle.init();
            
            // 백준 1단 레이아웃을 위한 사이드바 제거 및 중앙 정렬
            const sidebar = document.querySelector('#sidebar');
            if (sidebar) sidebar.style.display = 'none';
            
            const content = document.querySelector('#pageContent');
            if (content) {
                content.style.margin = '0 auto';
                content.style.float = 'none';
                content.style.width = '100%';
                content.style.maxWidth = '1000px';
            }
        }
    };
})();