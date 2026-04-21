/**
 * theme-init.js (v3.2)
 * 전역 네임스페이스 선언 및 다크모드 최우선 초기화 (FOUC 방어)
 */

// 모든 모듈이 공유할 전역 객체 생성 (네임스페이스 오염 방지)
window.BOJ_CF = window.BOJ_CF || {};
window.BOJ_CF.Utils = window.BOJ_CF.Utils || {};
window.BOJ_CF.Core = window.BOJ_CF.Core || {};
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Components = window.BOJ_CF.Components || {};

(function() {
    try {
        const savedTheme = localStorage.getItem('boj_cf_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();