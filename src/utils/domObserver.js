/**
 * src/utils/domObserver.js
 * 싱글톤 DOM 변화 감시자 (AJAX 테이블 갱신 감지)
 */
window.BOJ_CF.DOMObserver = (function() {
    let observer = null;
    const subscribers = [];
    const notifySubscribers = (mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0)) subscribers.forEach(cb => cb());
    };
    return {
        init: (targetSelector) => {
            if (observer) return;
            const target = document.querySelector(targetSelector);
            if (!target) return;
            observer = new MutationObserver(notifySubscribers);
            observer.observe(target, { childList: true, subtree: true });
        },
        subscribe: (cb) => { if (typeof cb === 'function') subscribers.push(cb); },
        disconnect: () => { if (observer) { observer.disconnect(); observer = null; } subscribers.length = 0; }
    };
})();