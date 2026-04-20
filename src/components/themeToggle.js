/**
 * src/components/themeToggle.js
 * 글로벌 다크모드/라이트모드 스위치
 */
window.BOJ_CF.Components = window.BOJ_CF.Components || {};
window.BOJ_CF.Components.ThemeToggle = (function() {
    let initialized = false;
    return {
        init: function() {
            if (initialized) return;
            document.body.addEventListener('click', (e) => {
                const btn = e.target.closest('#boj-theme-toggle');
                if (btn) {
                    const next = window.BOJ_CF.StateManager.getState().theme === 'dark' ? 'light' : 'dark';
                    window.BOJ_CF.StateManager.setTheme(next);
                }
            });
            initialized = true;
        }
    };
})();