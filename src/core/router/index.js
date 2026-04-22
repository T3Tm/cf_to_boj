/**
 * src/core/router/index.js (v4.0.1)
 * [Strategy Pattern] 경로별 페이지 컨트롤러 매핑 및 실행 엔진
 */
window.BOJ_CF.Router = (function() {
    const routes = [
        {
            // 문제 상세 페이지
            pattern: /^\/(problemset\/problem\/[0-9]+\/[A-Z0-9]+|contest\/[0-9]+\/problem\/[A-Z0-9]+)$/,
            handler: () => window.BOJ_CF.Pages.Problem?.init()
        },
        {
            // 문제 목록 페이지
            pattern: /^\/problemset(\/page\/[0-9]+)?$/,
            handler: () => window.BOJ_CF.Pages.Problemset?.init()
        },
        {
            // 제출 페이지
            pattern: /^\/(problemset\/submit|contest\/[0-9]+\/submit)$/,
            handler: () => window.BOJ_CF.Pages.Submit?.init()
        },
        {
            // 채점 현황 페이지 (일반 및 문제별 통합)
            pattern: /^\/(problemset\/status|status|contest\/[0-9]+\/status)(\/.*)?$/,
            handler: () => window.BOJ_CF.Pages.Status?.init()
        },
        {
            // 유저 프로필 페이지
            pattern: /^\/profile\/.*$/,
            handler: () => window.BOJ_CF.Pages.Profile?.init()
        }
    ];

    return {
        dispatch: function() {
            let path = window.location.pathname;

            // [추가] 제출 직후 리다이렉트 힌트 처리
            const redirectHint = localStorage.getItem('boj_cf_last_submit');
            if (redirectHint && path.endsWith('/status')) {
                localStorage.removeItem('boj_cf_last_submit');
                // 만약 현재 경로가 일반 status인데, 제출 직후라면 힌트 경로로 이동 유도 (선택 사항)
                // 여기서는 단순히 해당 힌트 정보를 Status.init()에 전달하거나 로직을 태움
                console.log(`[BOJ_CF] Redirect hint detected: ${redirectHint}`);
            }

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