/**
 * src/core/stateManager.js
 * 전역 상태 관리 및 Pub/Sub 패턴 구현
 */
window.BOJ_CF.StateManager = (function() {
    // 중앙 상태 저장소
    const state = {
        activeFilters: [], // ['#dp', '~@me'] 등의 활성화된 검색 조건
        theme: localStorage.getItem('boj_cf_theme') || 'light'
    };

    const listeners = [];

    const notify = () => {
        listeners.forEach(listener => listener(state));
    };

    return {
        getState: () => ({ ...state }),
        
        subscribe: (listener) => {
            listeners.push(listener);
        },

        // 필터(알약) 관련 액션
        addFilter: (filterText) => {
            const cleanText = window.BOJ_CF.Utils.escapeHTML(filterText.trim());
            if (cleanText && !state.activeFilters.includes(cleanText)) {
                state.activeFilters.push(cleanText);
                notify();
            }
        },
        removeFilter: (filterText) => {
            state.activeFilters = state.activeFilters.filter(f => f !== filterText);
            notify();
        },
        clearFilters: () => {
            state.activeFilters = [];
            notify();
        },

        // 테마 관련 액션
        setTheme: (newTheme) => {
            state.theme = newTheme;
            localStorage.setItem('boj_cf_theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            notify();
        }
    };
})();