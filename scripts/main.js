/**
 * scripts/main.js
 * 익스텐션 실행 입구 및 라우팅
 */
(function init() {
    const PATH = window.location.pathname;
    
    if (PATH.includes('/submit')) {
        setTimeout(transformSubmitPage, 150);
    } else if (PATH.includes('/status') || PATH.includes('/submissions')) {
        setTimeout(transformStatusPage, 150);
    } else if (PATH.includes('/problem/')) {
        setTimeout(transformProblemPage, 150);
    } else if (PATH.includes('/contests') || PATH.includes('/gyms')) {
        setTimeout(transformContestPage, 150); 
    } else if (PATH === '/problemset' || PATH.startsWith('/problemset/page/')) {
        setTimeout(transformProblemsetPage, 150); 
    } else if (PATH.startsWith('/profile/')) {
        // [중요] 이 줄이 있어야 프로필 페이지에서 변환 마법이 시작됩니다!
        setTimeout(transformProfilePage, 150);
    }
})();