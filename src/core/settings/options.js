/**
 * src/core/settings/options.js
 * 설정 페이지 로직 (저장 및 불러오기)
 */
document.addEventListener('DOMContentLoaded', () => {
    const fields = [
        'fontFamily', 'theme', 'showProblemTier', 
        'hideAlgorithmTags', 'editorTheme', 'editorFontSize'
    ];

    // 1. 저장된 설정 불러오기
    chrome.storage.sync.get(fields, (items) => {
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el && items[field] !== undefined) {
                if (el.type === 'number') el.value = items[field];
                else el.value = items[field];
            }
        });
    });

    // 2. 설정 저장하기
    document.getElementById('save-btn').addEventListener('click', () => {
        const newSettings = {};
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) {
                newSettings[field] = el.type === 'number' ? parseInt(el.value) : el.value;
            }
        });

        chrome.storage.sync.set(newSettings, () => {
            const status = document.getElementById('status-msg');
            status.textContent = '설정이 저장되었습니다.';
            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        });
    });
});