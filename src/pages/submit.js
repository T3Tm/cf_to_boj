/**
 * src/pages/submit.js (v4.0.0)
 * [Back to BOJ] 제출 페이지 컨트롤러 (사용성 중심의 에디터 환경)
 */
window.BOJ_CF.Pages.Submit = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const originalForm = document.querySelector('form.submit-form');
            if (!pc || !originalForm) return;

            // 1. 원본 요소 추출
            const langSelect = originalForm.querySelector('select[name="programTypeId"]');
            const codeTextArea = originalForm.querySelector('textarea[name="source"]');
            const submitBtn = originalForm.querySelector('#singlePageSubmitButton') || originalForm.querySelector('.submit');
            const problemDataCell = originalForm.querySelector('.field-name')?.parentElement?.querySelector('td:last-child');
            const problemFullText = problemDataCell?.innerText.trim() || '';

            if (!langSelect || !codeTextArea || !submitBtn) return;

            // 2. 탭 메뉴 생성 (백준 스타일)
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

            // 3. 페이지 레이아웃 재구축
            pc.innerHTML = tabMenuHtml;
            pc.appendChild(originalForm);

            // 폼 내부의 모든 레거시 요소 숨김
            Array.from(originalForm.children).forEach(child => {
                if (child.tagName !== 'INPUT' || child.type !== 'hidden') child.style.display = 'none';
            });

            // 백준 스타일 정밀 컨테이너 주입
            const newLayout = document.createElement('div');
            newLayout.className = 'submit-form-container';
            newLayout.innerHTML = `
                <div class="page-header"><h1 style="text-align: left; font-size: 28px; margin-bottom: 20px;">제출</h1></div>
                
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
                        <div class="boj-editor-wrapper" id="boj-editor-root">
                            <!-- 소스코드가 여기에 들어감 -->
                        </div>
                        <p style="font-size: 12px; color: var(--boj-text-light); margin-top: 8px;">
                            * 입력창의 텍스트가 투명할 경우 테마 전환을 다시 시도해주세요.
                        </p>
                    </div>
                </div>

                <div id="boj-target-submit" style="margin-top: 40px; text-align: center; padding-bottom: 50px;"></div>
            `;
            originalForm.appendChild(newLayout);

            // 요소 재배치
            document.getElementById('boj-editor-root').appendChild(codeTextArea);
            document.getElementById('boj-target-lang').appendChild(langSelect);
            document.getElementById('boj-target-submit').appendChild(submitBtn);

            // 4. 시각적 보정 (Surgical Style)
            langSelect.style.cssText = "width: 100%; max-width: 400px; padding: 10px; border: 1px solid var(--boj-border); border-radius: 4px; background: var(--boj-bg); color: var(--boj-text);";
            
            // Textarea 스타일 강제 재설정 (조작 가능하게)
            codeTextArea.style.cssText = `
                width: 100% !important;
                height: 500px !important;
                padding: 20px !important;
                font-family: 'Consolas', 'Monaco', monospace !important;
                font-size: 14px !important;
                line-height: 1.6 !important;
                color: var(--boj-text) !important;
                background-color: var(--boj-table-header) !important;
                border: none !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            `;
            codeTextArea.removeAttribute('hidden');
            codeTextArea.placeholder = "여기에 소스코드를 입력하세요...";

            // 제출 버튼 클래스 부여 (Frozen Design)
            submitBtn.className = "btn-boj-submit";
            submitBtn.id = "submit_button";
            submitBtn.value = "제출";

            // Ace Editor 및 불필요한 스크립트 요소 영구 삭제
            document.querySelectorAll('#editor, .toggleEditorCheckboxLabel, .tabSizeDiv, #toggleEditorCheckbox').forEach(el => el.remove());
        }
    };
})();