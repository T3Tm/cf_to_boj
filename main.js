/**
 * main.js
 * 확장 프로그램 진입점 및 라우터
 */
(function() {
    console.log("[BOJ_CF] Extension v3.7 Loaded");
    window.BOJ_CF.Components.ThemeToggle.init();

    const path = window.location.pathname;

    if (path.startsWith('/problemset/problem/')) {
        window.BOJ_CF.Pages.Problem.init();
    } else if (path === '/problemset' || path.startsWith('/problemset/page/')) {
        window.BOJ_CF.Pages.Problemset.init();
    } else if (path.startsWith('/problemset/status') || path.startsWith('/status')) {
        window.BOJ_CF.Pages.Status.init();
    } else if (path.startsWith('/profile/')) {
        window.BOJ_CF.Pages.Profile.init();
    }
})();