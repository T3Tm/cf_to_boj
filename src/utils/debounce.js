/**
 * src/utils/debounce.js
 * 연속된 함수 호출을 지연시켜 성능을 최적화하는 유틸리티
 */
window.BOJ_CF = window.BOJ_CF || {};
window.BOJ_CF.Utils = window.BOJ_CF.Utils || {};

window.BOJ_CF.Utils.debounce = function(func, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};