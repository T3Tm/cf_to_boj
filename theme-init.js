/**
 * theme-init.js (v3.1)
 * 전역 네임스페이스 선언 및 다크모드 최우선 초기화 (FOUC 방어)
 */

// 모든 모듈이 공유할 전역 객체 생성 (네임스페이스 오염 방지)
window.BOJ_CF = window.BOJ_CF || {};

(function() {
    // DOM이 그려지기 전 최상단 HTML 태그에 즉시 테마 적용
    try {
        const savedTheme = localStorage.getItem('boj_cf_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {
        console.error("[BOJ_CF] Theme Initialization Error:", e);
        // 에러 발생 시 라이트 모드 폴백(Fallback)
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();