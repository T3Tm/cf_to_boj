/**
 * src/components/themeToggle.js
 * 글로벌 다크모드/라이트모드 스위치
 */
window.BOJ_CF.Components = window.BOJ_CF.Components || {};
window.BOJ_CF.Components.ThemeToggle = (function() {
    return {
        init: function() {
            const btn = document.getElementById('boj-theme-toggle');
            // [수정된 부분] 버튼이 화면에 실제로 존재할 때만 이벤트를 달아주도록 조건문 추가
            if (btn) {
                btn.onclick = () => {
                    const next = window.BOJ_CF.StateManager.getState().theme === 'dark' ? 'light' : 'dark';
                    window.BOJ_CF.StateManager.setTheme(next);
                };
            }
        }
    };
})();