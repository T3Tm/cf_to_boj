/**
 * src/core/stateManager.js
 * 전역 상태 관리 및 Pub/Sub 모델
 */
window.BOJ_CF.StateManager = (function() {
    const state = { activeFilters: [], theme: localStorage.getItem('boj_cf_theme') || 'light' };
    const listeners = [];
    const notify = () => listeners.forEach(l => l(state));

    return {
        getState: () => ({ ...state }),
        subscribe: (l) => listeners.push(l),
        addFilter: (filterText) => {
            const cleanText = window.BOJ_CF.Utils.escapeHTML(filterText.trim());
            if (cleanText && !state.activeFilters.includes(cleanText)) {
                state.activeFilters.push(cleanText); notify();
            }
        },
        removeFilter: (filterText) => {
            state.activeFilters = state.activeFilters.filter(f => f !== filterText); notify();
        },
        setTheme: (newTheme) => {
            state.theme = newTheme;
            localStorage.setItem('boj_cf_theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            notify();
        }
    };
})();