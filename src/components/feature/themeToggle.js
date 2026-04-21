/**
 * src/components/feature/themeToggle.js (v4.0.0)
 * [Atomic Design] 기능성 컴포넌트 - 글로벌 테마 스위치
 */
window.BOJ_CF.Components.ThemeToggle = (function() {
    return {
        /**
         * 테마 전환 기능을 초기화합니다. (Header에서 호출됨)
         */
        init: function() {
            // 초기 테마 적용 (Settings 구독을 통한 자동 반영 대기)
            this.applyTheme(window.BOJ_CF.Settings.get('theme'));
        },

        /**
         * 다크/라이트 모드를 토글합니다.
         */
        toggle: function() {
            const current = window.BOJ_CF.Settings.get('theme');
            const next = current === 'dark' ? 'light' : 'dark';
            
            console.log(`[BOJ_CF] Switching theme: ${current} -> ${next}`);
            window.BOJ_CF.Settings.set('theme', next);
            this.applyTheme(next);
        },

        /**
         * 실제 DOM에 테마를 반영합니다.
         */
        applyTheme: function(theme) {
            const targetTheme = theme === 'auto' 
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : theme;
            
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('boj_cf_theme', targetTheme); // FOUC 방어용 백업
        }
    };
})();