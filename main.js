/**
 * main.js
 * 확장 프로그램 진입점 및 라우터
 */
(function() {
    console.log("[BOJ_CF] Extension v3.9 Loaded");
    window.BOJ_CF.Components.ThemeToggle.init();

    // 전역 백준 레이아웃 강제화 (사이드바 철거)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';

    // 네비게이션 바 한글화
    const menuList = document.querySelector('.menu-list');
    if (menuList) {
        const menuMap = { 'HOME': '홈', 'TOP': '랭킹', 'CONTESTS': '대회', 'GYM': '짐', 'PROBLEMSET': '문제', 'GROUPS': '그룹', 'RATING': '레이팅', 'EDU': '에듀', 'API': 'API', 'CALENDAR': '캘린더', 'HELP': '도움말' };
        menuList.querySelectorAll('li a').forEach(a => {
            const text = a.innerText.trim();
            if (menuMap[text]) a.innerText = menuMap[text];
        });
    }

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