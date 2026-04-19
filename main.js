/**
 * main.js
 * 확장 프로그램 최종 실행 엔트리
 */
(function() {
    console.log("[BOJ_CF] Extension Active");

    // 공통 컴포넌트 실행 (테마 토글 등)
    window.BOJ_CF.Components.ThemeToggle.init();

    const path = window.location.pathname;

    // 페이지 라우팅
    if (path.includes('/problemset/problem/')) {
        window.BOJ_CF.Pages.Problem.init();
    } else if (path.includes('/problemset')) {
        window.BOJ_CF.Pages.Problemset.init();
    } else if (path.includes('/profile/')) {
        // profile.js 로직 연결 가능
    }
})();