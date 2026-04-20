/**
 * src/components/themeToggle.js
 * 글로벌 다크모드/라이트모드 스위치
 */
window.BOJ_CF.Components = window.BOJ_CF.Components || {};
window.BOJ_CF.Components.ThemeToggle = (function() {
    return {
        init: function() {
            // main.js가 만든 버튼을 찾아서 이벤트만 연결
            const btn = document.getElementById('boj-theme-toggle');
            if (btn) {
                btn.onclick = () => {
                    const next = window.BOJ_CF.StateManager.getState().theme === 'dark' ? 'light' : 'dark';
                    window.BOJ_CF.StateManager.setTheme(next);
                };
            }
        }
    };
})();