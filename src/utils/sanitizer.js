/**
 * src/utils/sanitizer.js
 * 사용자 입력값 XSS 방어 새니타이저
 */
window.BOJ_CF.Utils.escapeHTML = function(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
};