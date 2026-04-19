/**
 * main.js
 * 확장 프로그램 진입점 및 라우터
 */
(function() {
    console.log("[BOJ_CF] Extension v3.1 Loaded");

    // 어느 페이지든 공통으로 들어가야 할 UI 마운트
    window.BOJ_CF.Components.ThemeToggle.init();

    // 현재 URL 경로를 파악하여 필요한 컨트롤러만 실행 (Tree Shaking)
    const path = window.location.pathname;

    if (path.includes('/problemset/problem/')) {
        window.BOJ_CF.Pages.Problem.init();
    } else if (path.includes('/problemset')) {
        window.BOJ_CF.Pages.Problemset.init();
    } else if (path.includes('/profile/')) {
        window.BOJ_CF.Pages.Profile.init();
    }
})();