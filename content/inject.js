/**
 * content/inject.js (v4.0.0)
 * [Bootstrap] 전역 네임스페이스 초기화 및 테마 최우선 적용 (FOUC 방어)
 */

// 1. 전역 네임스페이스 선언
window.BOJ_CF = window.BOJ_CF || {};
window.BOJ_CF.Utils = window.BOJ_CF.Utils || {};
window.BOJ_CF.Core = window.BOJ_CF.Core || {};
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Components = window.BOJ_CF.Components || {};

// 2. 테마 즉시 적용 (Settings 로드 전 깜빡임 방지용)
(function() {
    try {
        // localStorage에 저장된 마지막 테마를 최우선 적용
        const savedTheme = localStorage.getItem('boj_cf_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log(`[BOJ_CF] Bootstrap theme applied: ${savedTheme}`);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();