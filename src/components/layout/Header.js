/**
 * src/components/layout/Header.js (v4.0.0)
 * [Atomic Design] 전역 레이아웃 - 헤더 컴포넌트
 */
window.BOJ_CF.Components.Header = (function() {
    /**
     * 유저 데이터 추출 (Header에서만 사용)
     */
    function getUserData() {
        const langChooser = document.querySelector('.lang-chooser');
        const profileLink = langChooser ? langChooser.querySelector('a[href^="/profile/"]') : null;
        const logoutLink = langChooser ? langChooser.querySelector('a[href$="logout"]') : null;

        return {
            isLoggedIn: !!profileLink,
            handle: profileLink ? profileLink.innerText.trim() : 'Guest',
            profileUrl: profileLink ? profileLink.href : '#',
            logoutUrl: logoutLink ? logoutLink.href : '#'
        };
    }

    return {
        /**
         * 헤더를 렌더링하고 이벤트를 바인딩합니다.
         */
        render: function() {
            const header = document.getElementById('header');
            if (!header) return;

            const userData = getUserData();

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
                    ${userData.isLoggedIn ? `
                        <a href="${userData.profileUrl}" class="boj-header-user">${userData.handle}</a> 
                        <span style="margin:0 8px; color:var(--boj-border);">|</span> 
                        <a href="${userData.logoutUrl}" style="color:#888; text-decoration:none;">로그아웃</a>
                    ` : `
                        <a href="/enter" style="font-weight:bold; color:var(--boj-primary);">로그인</a>
                    `}
                </div>
            `;
            console.log("[BOJ_CF] Header rendered.");
        }
    };
})();