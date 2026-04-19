/**
 * src/pages/problem.js
 * 개별 문제 페이지 컨트롤러
 */
window.BOJ_CF.Pages.Problem = (function() {
    return {
        init: function() {
            // 스포일러 방지 컴포넌트만 단독 실행
            window.BOJ_CF.Components.SpoilerToggle.init();
        }
    };
})();