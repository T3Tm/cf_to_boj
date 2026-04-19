/**
 * src/components/themeToggle.js
 * 다크모드/라이트모드 전환 토글 UI 컴포넌트
 */
window.BOJ_CF = window.BOJ_CF || {};
window.BOJ_CF.Components = window.BOJ_CF.Components || {};

window.BOJ_CF.Components.ThemeToggle = (function() {
    return {
        init: function() {
            const langChooser = document.querySelector('.lang-chooser');
            // 이미 토글 버튼이 있거나, langChooser가 없으면 실행 안 함
            if (!langChooser || document.getElementById('boj-theme-toggle')) return;

            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'boj-theme-toggle';
            toggleBtn.innerHTML = '🌓 테마 전환';
            
            toggleBtn.onclick = () => {
                const currentState = window.BOJ_CF.StateManager.getState();
                const newTheme = currentState.theme === 'dark' ? 'light' : 'dark';
                // 상태 관리자에게 테마 변경 요청
                window.BOJ_CF.StateManager.setTheme(newTheme);
            };
            
            langChooser.insertBefore(toggleBtn, langChooser.firstChild);
        }
    };
})();