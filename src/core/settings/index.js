/**
 * src/core/settings/index.js (v4.0.0)
 * [Observer Pattern] 사용자 설정 관리 및 구독 엔진
 */
window.BOJ_CF.Settings = (function() {
    // 기본 설정값
    const defaults = {
        theme: 'auto',              // auto, light, dark
        showProblemTier: true,      // 문제 티어 표시 여부
        showUserTier: true,         // 유저 티어 표시 여부
        hideAlgorithmTags: true,    // 알고리즘 분류 기본 숨김
        usePagination: true,        // 채점 현황 페이지네이션 사용
        fontFamily: 'SUIT',         // 기본 폰트 설정 (0-1)
        editorTheme: 'monokai',     // 에디터 테마 (0-2)
        editorFontSize: 14          // 에디터 폰트 크기 (2-1-2)
    };

    let currentSettings = { ...defaults };
    const observers = [];

    /**
     * 설정을 로컬 스토리지에서 불러오고 변경 사항을 감시합니다.
     */
    async function init() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                chrome.storage.sync.get(defaults, (items) => {
                    currentSettings = { ...items };
                    console.log("[BOJ_CF] Settings loaded:", currentSettings);
                    resolve(currentSettings);
                });

                // 외부(Options 페이지 등)에서의 변경 감지
                chrome.storage.onChanged.addListener((changes, area) => {
                    if (area === 'sync') {
                        for (let [key, { newValue }] of Object.entries(changes)) {
                            currentSettings[key] = newValue;
                        }
                        notifyObservers(currentSettings);
                    }
                });
            } else {
                console.warn("[BOJ_CF] chrome.storage.sync not available, using defaults.");
                resolve(currentSettings);
            }
        });
    }

    function notifyObservers(settings) {
        observers.forEach(callback => callback(settings));
    }

    return {
        init,
        
        /**
         * 특정 설정값 가져오기
         */
        get: (key) => currentSettings[key],

        /**
         * 모든 설정값 가져오기
         */
        getAll: () => ({ ...currentSettings }),

        /**
         * 설정값 저장하기
         */
        set: function(key, value) {
            currentSettings[key] = value;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                chrome.storage.sync.set({ [key]: value });
            }
            notifyObservers(currentSettings);
        },

        /**
         * 설정 변경 구독
         */
        subscribe: function(callback) {
            observers.push(callback);
            // 등록 시 현재 설정을 즉시 전달
            callback(currentSettings);
        }
    };
})();