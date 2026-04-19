/**
 * theme-init.js
 * 전역 네임스페이스 선언 및 다크모드 최우선 초기화
 */

// 모든 모듈이 공유할 전역 객체 생성
window.BOJ_CF = window.BOJ_CF || {};

(function() {
    // 깜빡임 방지를 위해 최상단 HTML 태그에 즉시 테마 적용
    const savedTheme = localStorage.getItem('boj_cf_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();