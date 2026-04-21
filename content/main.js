/**
 * content/main.js (v4.0.0)
 * [Orchestrator] 확장 프로그램 진입점 및 전역 레이아웃 제어
 */
(async function() {
    console.log("[BOJ_CF] Extension v4.0.0 Initializing...");

    /**
     * 전역 레이아웃 초기화
     */
    function initGlobalLayout() {
        // 1. 헤더 렌더링 (컴포넌트 호출)
        if (window.BOJ_CF?.Components?.Header) {
            window.BOJ_CF.Components.Header.render();
        }

        // 2. 전역 스타일 제어
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        // 3. 테마 초기 설정 (Settings 구독을 통한 자동 반영은 컴포넌트 내부에서 처리)
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