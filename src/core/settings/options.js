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
    chrome.storage.sync.get([...fields, 'preferredLanguages'], (items) => {
        // 일반 필드 복원
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el && items[field] !== undefined) {
                el.value = items[field];
            }
        });

        // 선호 언어 체크박스 복원
        const prefLangs = items.preferredLanguages || [];
        const checkboxes = document.querySelectorAll('input[name="pref-lang"]');
        checkboxes.forEach(cb => {
            if (prefLangs.includes(cb.value)) {
                cb.checked = true;
            }
        });
    });

    // 2. 설정 저장하기
    document.getElementById('save-btn').addEventListener('click', () => {
        const newSettings = {};
        
        // 일반 필드 수집
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) {
                newSettings[field] = el.type === 'number' ? parseInt(el.value) : el.value;
            }
        });

        // 선호 언어 수집
        const selectedLangs = [];
        document.querySelectorAll('input[name="pref-lang"]:checked').forEach(cb => {
            selectedLangs.push(cb.value);
        });
        newSettings['preferredLanguages'] = selectedLangs;

        chrome.storage.sync.set(newSettings, () => {
            const status = document.getElementById('status-msg');
            status.textContent = '설정이 저장되었습니다.';
            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        });
    });
});