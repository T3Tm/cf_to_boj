/**
 * src/pages/submit.js (v4.0.0)
 * [Editor Enhancement] 제출 페이지 컨트롤러 (BOJ 스타일 하이라이터 내장)
 */
window.BOJ_CF.Pages.Submit = (function() {
    /**
     * 단순 정규표현식 기반 구문 강조 엔진 (C, C++, Java, Python 지원)
     */
    function applyHighlight(code) {
        const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        return escaped
            // 주석 (Comments)
            .replace(/(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g, '<span class="hljs-comment">$1</span>')
            // 문자열 (Strings)
            .replace(/("(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*')/g, '<span class="hljs-string">$1</span>')
            // 전처리기 및 임포트 (Preprocessors & Imports)
            .replace(/(^|\n)(#include|#define|#if|#endif|#else|import|from|package)\b/g, '$1<span class="hljs-preprocessor">$2</span>')
            // 타입 (Types)
            .replace(/\b(int|long|float|double|char|void|bool|boolean|byte|short|unsigned|signed|size_t|string|vector|map|set|list|auto)\b/g, '<span class="hljs-type">$1</span>')
            // 예약어 (Keywords)
            .replace(/\b(if|else|elif|for|while|do|switch|case|default|break|continue|return|try|except|catch|finally|throw|raise|class|struct|interface|extends|implements|public|private|protected|static|final|using|namespace|std|as|with|yield|lambda|global|nonlocal|del|assert|pass|new|delete|this|super|null|None|True|False)\b/g, '<span class="hljs-keyword">$1</span>');
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

            // 1. 레이아웃 초기화
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');

            let tabMenuHtml = '';
            if (contestId && problemIndex) {
                tabMenuHtml = `
                    <ul class="nav nav-pills problem-menu">
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

            // 2. 신규 레이아웃 주입
            const newLayout = document.createElement('div');
            newLayout.className = 'submit-form-container';
            newLayout.innerHTML = `
                <div class="page-header"><h1 style="text-align: left; font-size: 28px;">제출</h1></div>
                <div class="submit-form-row">
                    <div class="submit-form-label">문제</div>
                    <div class="submit-form-input-group">
                        <div style="padding: 12px; background: var(--boj-table-header); border: 1px solid var(--boj-border); border-radius: 4px; font-weight: bold;">
                            ${problemFullText || '문제를 선택해주세요'}
                        </div>
                    </div>
                </div>
                <div class="submit-form-row">
                    <div class="submit-form-label">언어</div>
                    <div id="boj-target-lang" class="submit-form-input-group"></div>
                </div>
                <div class="submit-form-row" style="align-items: flex-start; margin-top: 20px;">
                    <div class="submit-form-label" style="padding-top: 10px;">소스 코드</div>
                    <div class="submit-form-input-group">
                        <div class="boj-editor-wrapper">
                            <pre id="boj-code-highlight"></pre>
                            <div id="boj-target-code"></div>
                        </div>
                    </div>
                </div>
                <div id="boj-target-submit" class="submit-button-container" style="margin-top: 30px; text-align: center;"></div>
            `;
            originalForm.appendChild(newLayout);

            document.getElementById('boj-target-lang').appendChild(langSelect);
            document.getElementById('boj-target-code').appendChild(codeTextArea);
            document.getElementById('boj-target-submit').appendChild(submitBtn);

            // 3. 하이라이터 이벤트 바인딩
            const highlightLayer = document.getElementById('boj-code-highlight');
            
            const syncHighlight = () => {
                const code = codeTextArea.value;
                highlightLayer.innerHTML = applyHighlight(code) + "\n"; // 마지막 줄 커서 위치 보정
            };

            codeTextArea.addEventListener('input', syncHighlight);
            codeTextArea.addEventListener('scroll', () => {
                highlightLayer.scrollTop = codeTextArea.scrollTop;
                highlightLayer.scrollLeft = codeTextArea.scrollLeft;
            });

            // 초기 실행
            syncHighlight();
            
            // 기타 시각적 보정
            langSelect.style.cssText = "width: 100%; max-width: 400px; padding: 8px; border: 1px solid var(--boj-border); border-radius: 4px; background: var(--boj-bg); color: var(--boj-text);";
            submitBtn.className = "btn-boj-submit";
            submitBtn.value = "제출";

            document.querySelectorAll('#editor, .toggleEditorCheckboxLabel, .tabSizeDiv, #toggleEditorCheckbox').forEach(el => el.remove());
        }
    };
})();