/**
 * src/utils/domObserver.js
 * 싱글톤 DOM 변화 감시자 (AJAX 테이블 갱신 감지)
 */
window.BOJ_CF.DOMObserver = (function() {
    let observer = null;
    const subscribers = [];

    const notifySubscribers = (mutations) => {
        // 유의미한 노드 추가가 있을 때만 알림
        const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
        if (hasAddedNodes) {
            subscribers.forEach(callback => callback());
        }
    };

    return {
        init: (targetSelector) => {
            if (observer) return; // 이미 실행 중이면 무시
            const target = document.querySelector(targetSelector);
            if (!target) return;

            observer = new MutationObserver(notifySubscribers);
            observer.observe(target, { childList: true, subtree: true });
        },
        subscribe: (callback) => {
            if (typeof callback === 'function') {
                subscribers.push(callback);
            }
        },
        disconnect: () => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }
    };
})();