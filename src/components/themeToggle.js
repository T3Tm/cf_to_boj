/**
 * src/components/themeToggle.js
 * 글로벌 다크모드/라이트모드 스위치
 */
window.BOJ_CF.Components = window.BOJ_CF.Components || {};
window.BOJ_CF.Components.ThemeToggle = (function() {
    let initialized = false; // 중복 바인딩 방지
    return {
        init: function() {
            if (initialized) return;
            // [방어] 전역 이벤트 위임(Event Delegation)
            document.body.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'boj-theme-toggle') {
                    const next = window.BOJ_CF.StateManager.getState().theme === 'dark' ? 'light' : 'dark';
                    window.BOJ_CF.StateManager.setTheme(next);
                }
            });
            initialized = true;
        }
    };
})();