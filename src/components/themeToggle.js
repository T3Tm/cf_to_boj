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

            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'boj-theme-toggle';
            toggleBtn.innerHTML = '🌓 테마 전환';
            
            toggleBtn.onclick = () => {
                const currentState = window.BOJ_CF.StateManager.getState();
                const newTheme = currentState.theme === 'dark' ? 'light' : 'dark';
                window.BOJ_CF.StateManager.setTheme(newTheme);
            };
            
            langChooser.insertBefore(toggleBtn, langChooser.firstChild);
        }
    };
})();