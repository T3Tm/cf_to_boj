/**
 * src/components/themeToggle.js
 * 글로벌 다크모드/라이트모드 스위치
 */
window.BOJ_CF.Components = window.BOJ_CF.Components || {};
window.BOJ_CF.Components.ThemeToggle = (function() {
    return {
        init: function() {
            const langChooser = document.querySelector('.lang-chooser');
            if (!langChooser || document.getElementById('boj-theme-toggle')) return;
            const btn = document.createElement('button');
            btn.id = 'boj-theme-toggle'; btn.innerHTML = '🌓 테마 전환';
            btn.onclick = () => window.BOJ_CF.StateManager.setTheme(window.BOJ_CF.StateManager.getState().theme === 'dark' ? 'light' : 'dark');
            langChooser.insertBefore(btn, langChooser.firstChild);
        }
    };
})();