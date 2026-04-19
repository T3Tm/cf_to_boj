/**
 * src/pages/problem.js
 * 개별 문제 페이지 컨트롤러
 */
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Problem = (function() {
    return {
        init: function() {
            window.BOJ_CF.Components.SpoilerToggle.init();
            const sidebar = document.querySelector('#sidebar');
            if (sidebar) sidebar.style.display = 'none';
            const content = document.querySelector('#pageContent');
            if (content) { content.style.margin = '0 auto'; content.style.float = 'none'; content.style.width = '100%'; content.style.maxWidth = '1000px'; }
        }
    };
})();