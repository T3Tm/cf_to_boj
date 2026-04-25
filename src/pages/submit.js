/**
 * src/pages/submit.js (v4.2.0)
 * [Logic] Ace Editor 통합 및 제출 로직 강화
 */
window.BOJ_CF.Pages.Submit = (function() {
    let editor = null;

    /**
     * Ace Editor를 동적으로 로드하고 초기화합니다.
     */
    async function initAceEditor(targetId, initialValue, langId) {
        if (typeof ace === 'undefined') {
            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/ace.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        editor = ace.edit(targetId);
        
        // 설정 반영
        const settings = window.BOJ_CF.Settings.getAll();
        const theme = settings.editorTheme || 'monokai';
        const fontSize = settings.editorFontSize || 14;

        editor.setTheme(`ace/theme/${theme}`);
        editor.setFontSize(fontSize);
        editor.setValue(initialValue, -1);
        
        updateEditorMode(langId);

        return editor;
    }

    /**
     * 코드포스 언어 ID에 맞춰 Ace Editor 모드를 변경합니다.
     */
    function updateEditorMode(langId) {
        if (!editor) return;
        let mode = 'text';
        const lid = String(langId);

        if (lid.includes('cpp') || lid.includes('gcc') || lid.includes('g++')) mode = 'c_cpp';
        else if (lid.includes('java')) mode = 'java';
        else if (lid.includes('python') || lid.includes('pypy')) mode = 'python';
        else if (lid.includes('cs') || lid.includes('c#')) mode = 'csharp';
        else if (lid.includes('js') || lid.includes('node')) mode = 'javascript';
        else if (lid.includes('go')) mode = 'golang';
        else if (lid.includes('rust')) mode = 'rust';

        editor.session.setMode(`ace/mode/${mode}`);
    }

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const originalForm = document.querySelector('form.submit-form');
            if (!pc || !originalForm) return;

            const langSelect = originalForm.querySelector('select[name="programTypeId"]');
            const codeTextArea = originalForm.querySelector('textarea[name="source"]');
            const submitBtn = originalForm.querySelector('#singlePageSubmitButton') || originalForm.querySelector('.submit');
            const problemDataCell = originalForm.querySelector('.field-name')?.parentElement?.querySelector('td:last-child');
            const problemFullText = problemDataCell?.innerText.trim() || '';

            if (!langSelect || !codeTextArea || !submitBtn) return;

            // 레이아웃 구성
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');

            let tabMenuHtml = '';
            if (contestId && problemIndex) {
                tabMenuHtml = `
                    <ul class="boj-tabs problem-menu">
                        <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                        <li class="active"><a href="#">제출</a></li>
                        <li><a href="/problemset/status/${contestId}/problem/${problemIndex}">채점 현황</a></li>
                    </ul>
                `;
            }

            pc.innerHTML = tabMenuHtml;
            pc.appendChild(originalForm);

            Array.from(originalForm.children).forEach(child => {
                if (child.tagName !== 'INPUT' || child.type !== 'hidden') child.style.display = 'none';
            });

            const container = document.createElement('div');
            container.className = 'submit-form-container';
            container.innerHTML = `
                <div class="boj-header-section"><h1 style="text-align: left; font-size: 28px; color: var(--text-main);">제출</h1></div>
                <div class="submit-form-row">
                    <div class="submit-form-label">문제</div>
                    <div class="submit-form-input-group">
                        <div style="padding: 12px; background: var(--bg-element); border: 1px solid var(--border-standard); border-radius: var(--radius-main); font-weight: bold; color: var(--text-main);">
                            ${problemFullText}
                        </div>
                    </div>
                </div>
                <div class="submit-form-row">
                    <div class="submit-form-label">언어</div>
                    <div id="boj-target-lang" class="submit-form-input-group"></div>
                </div>
                <div class="submit-form-row">
                    <div class="submit-form-label">소스 코드</div>
                    <div class="submit-form-input-group">
                        <div id="boj-ace-editor" style="height: 500px; border: 1px solid var(--border-standard); border-radius: var(--radius-main);"></div>
                    </div>
                </div>
                <div id="boj-target-submit" style="margin-top: 40px; text-align: center;"></div>
            `;
            originalForm.appendChild(container);

            document.getElementById('boj-target-lang').appendChild(langSelect);
            document.getElementById('boj-target-submit').appendChild(submitBtn);
            
            // Ace Editor 초기화
            codeTextArea.style.display = 'none';
            await initAceEditor('boj-ace-editor', codeTextArea.value, langSelect.value);

            // 이벤트 바인딩: 에디터 내용 -> 원본 textarea 동기화
            editor.on('change', () => {
                codeTextArea.value = editor.getValue();
            });

            // 이벤트 바인딩: 언어 변경 -> 에디터 모드 변경
            langSelect.addEventListener('change', (e) => {
                updateEditorMode(e.target.value);
            });

            submitBtn.className = "boj-btn boj-btn-primary";
            submitBtn.value = "제출";

            originalForm.addEventListener('submit', () => {
                if (contestId && problemIndex) {
                    localStorage.setItem('boj_cf_last_submit', `/problemset/status/${contestId}/problem/${problemIndex}`);
                }
            });
        }
    };
})();