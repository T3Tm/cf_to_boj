/**
 * src/pages/submit.js (v4.0.1)
 * [Frozen Design] 제출 페이지 컨트롤러 (BOJ_REFERENCE.md 표준 준수)
 */
window.BOJ_CF.Pages.Submit = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const originalForm = document.querySelector('form.submit-form');
            if (!pc || !originalForm) return;

            // 1. 핵심 요소 획득
            const langSelect = originalForm.querySelector('select[name="programTypeId"]');
            const codeTextArea = originalForm.querySelector('textarea[name="source"]');
            const submitBtn = originalForm.querySelector('#singlePageSubmitButton') || originalForm.querySelector('.submit');
            const problemDataCell = originalForm.querySelector('.field-name')?.parentElement?.querySelector('td:last-child');
            const problemFullText = problemDataCell?.innerText.trim() || '';

            if (!langSelect || !codeTextArea || !submitBtn) return;

            // 2. 탭 메뉴 구성
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');

            let tabMenuHtml = '';
            if (contestId && problemIndex) {
                tabMenuHtml = `
                    <ul class="nav nav-tabs problem-menu">
                        <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                        <li class="active"><a href="#">제출</a></li>
                        <li><a href="/problemset/status/${contestId}/problem/${problemIndex}">채점 현황</a></li>
                    </ul>
                `;
            }

            // 3. 페이지 초기화 및 폼 재주입
            pc.innerHTML = tabMenuHtml;
            pc.appendChild(originalForm);

            // 폼 내부 레거시 요소 숨김 (Input Hidden 제외)
            Array.from(originalForm.children).forEach(child => {
                if (child.tagName !== 'INPUT' || child.type !== 'hidden') child.style.display = 'none';
            });

            // 4. 백준 오리지널 레이아웃 주입
            const container = document.createElement('div');
            container.className = 'submit-form-container';
            container.innerHTML = `
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

                <div class="submit-form-row">
                    <div class="submit-form-label">소스 코드</div>
                    <div class="submit-form-input-group">
                        <div class="boj-editor-wrapper" id="boj-editor-root">
                            <!-- 소스코드가 여기에 들어감 -->
                        </div>
                    </div>
                </div>

                <div id="boj-target-submit" style="margin-top: 40px; text-align: center;"></div>
            `;
            originalForm.appendChild(container);

            // 5. 원본 요소들 최종 배치
            document.getElementById('boj-target-lang').appendChild(langSelect);
            document.getElementById('boj-editor-root').appendChild(codeTextArea);
            document.getElementById('boj-target-submit').appendChild(submitBtn);

            // 6. 속성 고정 (조작성 보장)
            codeTextArea.style.visibility = 'visible';
            codeTextArea.style.display = 'block';
            codeTextArea.style.height = '600px'; // 높이 확대
            codeTextArea.removeAttribute('hidden');
            
            submitBtn.className = "btn-boj-submit";
            submitBtn.value = "제출";

            // 제출 후 리다이렉트 방어 (해당 문제 채점 현황으로 유도)
            originalForm.addEventListener('submit', () => {
                // 코드포스 기본 동작을 막지 않고, 제출 직후 로컬 스토리지에 힌트를 저장하여 
                // 다음 로드 시 라우팅에 참고할 수 있게 함 (CF 기본은 /status 로 감)
                if (contestId && problemIndex) {
                    localStorage.setItem('boj_cf_last_submit', `/problemset/status/${contestId}/problem/${problemIndex}`);
                }
            });

            // 레거시 잔재 영구 제거
            document.querySelectorAll('#editor, .toggleEditorCheckboxLabel, .tabSizeDiv, #toggleEditorCheckbox').forEach(el => el.remove());
            console.log("[BOJ_CF] Submission page standardized.");
        }
    };
})();