/**
 * content/main.js (v4.0.0)
 * [Orchestrator] 확장 프로그램 진입점 및 전역 레이아웃 제어
 */
(async function() {
    console.log("[BOJ_CF] Extension v4.0.0 Initializing...");

    /**
     * 전역 레이아웃 및 헤더 초기화
     */
    function initGlobalLayout() {
        const langChooser = document.querySelector('.lang-chooser');
        const profileLink = langChooser ? langChooser.querySelector('a[href^="/profile/"]') : null;
        const logoutLink = langChooser ? langChooser.querySelector('a[href$="logout"]') : null;

        const handle = profileLink ? profileLink.innerText.trim() : 'Unknown';
        const profileUrl = profileLink ? profileLink.href : '#';
        const logoutUrl = logoutLink ? logoutLink.href : '#';

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

        // 테마 토글 컴포넌트 초기화
        if (window.BOJ_CF?.Components?.ThemeToggle) {
            window.BOJ_CF.Components.ThemeToggle.init();
        }
        
        // 코드포스 기본 사이드바 숨김
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';
    }

    // 실행 시작
    try {
        // 1. 설정 시스템 초기화 (비동기)
        if (window.BOJ_CF.Settings) {
            await window.BOJ_CF.Settings.init();
        }

        // 2. 전역 레이아웃 초기화
        initGlobalLayout();
        
        // 3. 라우터 실행 (현재 경로에 맞는 페이지 컨트롤러 호출)
        if (window.BOJ_CF.Router) {
            window.BOJ_CF.Router.dispatch();
        } else {
            console.error("[BOJ_CF] Router not found.");
        }
    } catch (error) {
        console.error("[BOJ_CF] Initialization failed:", error);
    }
})();