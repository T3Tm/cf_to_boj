/**
 * src/core/router/index.js (v4.0.0)
 * [Strategy Pattern] 경로별 페이지 컨트롤러 매핑 및 실행 엔진
 */
window.BOJ_CF.Router = (function() {
    const routes = [
        {
            // 문제 상세 페이지 (Problem)
            pattern: /^\/(problemset\/problem\/[0-9]+\/[A-Z0-9]+|contest\/[0-9]+\/problem\/[A-Z0-9]+)$/,
            handler: () => window.BOJ_CF.Pages.Problem?.init()
        },
        {
            // 문제 목록 페이지 (Problemset)
            pattern: /^\/problemset(\/page\/[0-9]+)?$/,
            handler: () => window.BOJ_CF.Pages.Problemset?.init()
        },
        {
            // 제출 페이지 (Submit)
            pattern: /^\/(problemset\/submit|contest\/[0-9]+\/submit)$/,
            handler: () => window.BOJ_CF.Pages.Submit?.init()
        },
        {
            // 채점 현황 페이지 (Status)
            pattern: /^\/(problemset\/status|status|contest\/[0-9]+\/status)(\/.*)?$/,
            handler: () => window.BOJ_CF.Pages.Status?.init()
        },
        {
            // 유저 프로필 페이지 (Profile)
            pattern: /^\/profile\/.*$/,
            handler: () => window.BOJ_CF.Pages.Profile?.init()
        }
    ];

    return {
        /**
         * 현재 경로를 기반으로 적절한 페이지 컨트롤러를 실행합니다.
         */
        dispatch: function() {
            const path = window.location.pathname;
            console.log(`[BOJ_CF] Routing path: ${path}`);

            for (const route of routes) {
                if (route.pattern.test(path)) {
                    route.handler();
                    return true;
                }
            }
            return false;
        }
    };
})();