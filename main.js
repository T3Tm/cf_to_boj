/**
 * main.js (v3.2)
 * 확장 프로그램 진입점 및 라우터
 */
(function() {
    console.log("[BOJ_CF] Extension v3.2 Loaded");

    // 1. 기존 헤더에서 유저 데이터 안전하게 백업
    const langChooser = document.querySelector('.lang-chooser');
    const profileLink = langChooser ? langChooser.querySelector('a[href^="/profile/"]') : null;
    const logoutLink = langChooser ? langChooser.querySelector('a[href$="logout"]') : null;

    const handle = profileLink ? profileLink.innerText.trim() : 'Unknown';
    const profileUrl = profileLink ? profileLink.href : '#';
    const logoutUrl = logoutLink ? logoutLink.href : '#';

    // 2. 헤더 재건축
    const header = document.getElementById('header');
    if (header) {
        header.innerHTML = `
            <div class="boj-header-left">
                <a href="/" style="font-size: 22px; font-weight: 900; color: var(--boj-primary); text-decoration: none; letter-spacing: -0.5px;">Codeforces</a>
            </div>
            <div class="boj-header-center">
                <ul class="boj-menu-list">
                    <li><a href="/problemset">문제</a></li>
                    <li><a href="/contests">대회</a></li>
                    <li><a href="/problemset/status">채점 현황</a></li>
                    <li><a href="/ratings">랭킹</a></li>
                    <li><a href="/groups">그룹</a></li>
                </ul>
            </div>
            <div class="boj-header-right">
                <button id="boj-theme-toggle">🌓 테마 전환</button>
                ${profileLink ? `
                    <a href="${profileUrl}" class="boj-header-user">${handle}</a> 
                    <span style="margin:0 8px; color:var(--boj-border);">|</span> 
                    <a href="${logoutUrl}" style="color:#888; text-decoration:none;">로그아웃</a>
                ` : `
                    <a href="/enter" style="font-weight:bold; color:var(--boj-primary);">로그인</a>
                `}
            </div>
        `;
    }

    // 3. 컴포넌트 초기화
    window.BOJ_CF.Components.ThemeToggle.init();

    // 4. 전역 레이아웃 조정
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';

    // 5. 정밀 라우팅 (Exact Match / Regex)
    const path = window.location.pathname;

    if (path.match(/^\/problemset\/problem\/[0-9]+\/[A-Z0-9]+$/)) {
        window.BOJ_CF.Pages.Problem.init();
    } else if (path === '/problemset' || path.startsWith('/problemset/page/')) {
        window.BOJ_CF.Pages.Problemset.init();
    } else if (path === '/problemset/status' || path === '/status' || path.startsWith('/problemset/status/page/')) {
        window.BOJ_CF.Pages.Status.init();
    } else if (path.startsWith('/profile/')) {
        window.BOJ_CF.Pages.Profile.init();
    }
})();