/**
 * src/pages/submit.js (v3.3.9)
 * 제출 페이지 컨트롤러 (폼 컨텍스트 유지형 레이아웃 재배치)
 * 3차 정밀 검토 완료: 폼 무결성 유지, 페이지 완전 초기화, Ace Editor 차단
 */
window.BOJ_CF.Pages.Submit = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const originalForm = document.querySelector('form.submit-form');
            if (!pc || !originalForm) return;

            // [재검토 1단계: 핵심 요소 획득 및 원본 폼 보호]
            const langSelect = originalForm.querySelector('select[name="programTypeId"]');
            const codeTextArea = originalForm.querySelector('textarea[name="source"]');
            const submitBtn = originalForm.querySelector('#singlePageSubmitButton') || originalForm.querySelector('.submit');
            const problemDataCell = originalForm.querySelector('.field-name')?.parentElement?.querySelector('td:last-child');
            const problemFullText = problemDataCell?.innerText.trim() || '';

            if (!langSelect || !codeTextArea || !submitBtn) return;

            // [재검토 2단계: 페이지 완전 초기화 (탭 + 폼만 남김)]
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');

            // 탭 메뉴 미리 생성
            let tabMenuHtml = '';
            if (contestId && problemIndex) {
                tabMenuHtml = `
                    <ul class="nav nav-pills problem-menu">
                        <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                        <li class="active"><a href="#">제출</a></li>
                        <li><a href="/problemset/status?contestId=${contestId}&index=${problemIndex}">채점 현황</a></li>
                    </ul>
                `;
            }

            // 페이지 콘텐츠 초기화 및 원본 폼 재삽입
            pc.innerHTML = tabMenuHtml; // 탭 메뉴 먼저 넣기
            pc.appendChild(originalForm); // 원본 폼을 pc 하위로 이동 (기존 테이블 등은 폼 안에 있음)

            // [재검토 3단계: 폼 내부 레이아웃 재구성]
            // 폼 안의 기존 UI(테이블 등)를 모두 숨김
            Array.from(originalForm.children).forEach(child => {
                if (child.tagName !== 'INPUT' || child.type !== 'hidden') {
                    child.style.display = 'none';
                }
            });

            // 폼 내부에 새 백준 스타일 컨테이너 생성 (폼의 직접적인 자식으로)
            const newLayout = document.createElement('div');
            newLayout.className = 'submit-form-container';
            newLayout.style.marginTop = '30px';
            newLayout.innerHTML = `
                <div class="page-header"><h1 style="text-align: left; font-size: 28px;">제출</h1></div>
                <div class="submit-form-row">
                    <div class="submit-form-label">문제</div>
                    <div class="submit-form-input-group">
                        <div style="padding: 12px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; font-weight: bold; color: #333;">
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
                    <div id="boj-target-code" class="submit-form-input-group"></div>
                </div>
                <div id="boj-target-submit" class="submit-button-container" style="margin-top: 30px;"></div>
            `;
            originalForm.appendChild(newLayout);

            // 원본 요소들을 폼 내부의 새 위치로 이동
            document.getElementById('boj-target-lang').appendChild(langSelect);
            document.getElementById('boj-target-code').appendChild(codeTextArea);
            document.getElementById('boj-target-submit').appendChild(submitBtn);

            // 시각적 보정
            langSelect.style.cssText = "width: 100%; max-width: 400px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; display: block;";
            codeTextArea.style.cssText = "width: 100%; height: 500px; font-family: 'Consolas', 'Monaco', monospace; line-height: 1.5; padding: 15px; border: 1px solid #ccc; border-radius: 4px; display: block !important;";
            codeTextArea.hidden = false;
            codeTextArea.removeAttribute('hidden');
            
            submitBtn.className = "btn-boj-submit";
            submitBtn.value = "제출";

            // Ace Editor 및 불필요한 스크립트 요소 영구 삭제
            document.querySelectorAll('#editor, .toggleEditorCheckboxLabel, .tabSizeDiv, #toggleEditorCheckbox').forEach(el => el.remove());
        }
    };
})();