/**
 * src/pages/problem.js
 * 개별 문제 페이지 컨트롤러
 */
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Problem = (function() {
    return {
        init: function() {
            window.BOJ_CF.Components.SpoilerToggle.init();
        }
    };
})();