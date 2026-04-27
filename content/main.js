/**
 * content/main.js (v4.0.0)
 * [Orchestrator] 확장 프로그램 진입점 및 전역 레이아웃 제어
 */
(async function() {
    console.log("[BOJ_CF] Extension v4.0.0 Initializing...");

    /**
     * 전역 레이아웃 및 스타일 초기화
     */
    function initGlobalLayout() {
        // 1. 헤더 렌더링
        if (window.BOJ_CF?.Components?.Header) {
            window.BOJ_CF.Components.Header.render();
        }

        // 2. 전역 스타일 제어 (사이드바 숨김 등)
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        // 3. 폰트 및 설정 실시간 반영
        if (window.BOJ_CF.Settings) {
            // 외부 폰트 (SUIT) 로드
            if (!document.getElementById('boj-cf-font-suit')) {
                const link = document.createElement('link');
                link.id = 'boj-cf-font-suit';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/static/woff2/SUIT.css';
                document.head.appendChild(link);
            }

            const fontStyle = document.createElement('style');
            fontStyle.id = 'boj-cf-global-font';
            document.head.appendChild(fontStyle);

            window.BOJ_CF.Settings.subscribe((settings) => {
                // 폰트 적용
                const ff = settings.fontFamily || 'SUIT';
                fontStyle.innerHTML = `
                    body, input, textarea, select, button { 
                        font-family: "${ff}", "SUIT", sans-serif !important; 
                    }
                `;
                
                // 테마 적용 (data-theme 속성 활용)
                let theme = settings.theme || 'auto';
                if (theme === 'auto') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', theme);
                
                console.log(`[BOJ_CF] Settings applied - Font: ${ff}, Theme: ${theme}`);
            });
        }
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