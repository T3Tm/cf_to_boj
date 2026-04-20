/**
 * src/pages/submit.js (v3.3.3)
 * 제출 페이지 컨트롤러 (BOJ 스타일 폼, 탭 바 유지, 파일 업로드 제거)
 * 3차 정밀 검토 완료: 중복 변수 제거, 옵셔널 체이닝 강화, CSS 클래스 정합성 확인
 */
window.BOJ_CF.Pages.Submit = (function() {
    return {
        init: function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // 1. URL 파라미터에서 문제 정보 추출
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');
            const problemId = (contestId && problemIndex) ? `${contestId}${problemIndex}` : '';

            // 2. 탭 메뉴 생성 (문제에서 넘어온 경우에만)
            if (contestId && problemIndex) {
                let existingTabs = document.querySelector('.problem-menu');
                if (!existingTabs) {
                    const tabMenu = document.createElement('ul');
                    tabMenu.className = 'nav nav-pills problem-menu';
                    tabMenu.innerHTML = `
                        <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                        <li class="active"><a href="#">제출</a></li>
                        <li><a href="/problemset/status?contestId=${contestId}&index=${problemIndex}">채점 현황</a></li>
                    `;
                    pc.insertBefore(tabMenu, pc.firstChild);
                }
            }

            // 3. 기존 폼 데이터 백업 및 안전 추출
            const originalForm = document.querySelector('form.submit-form');
            if (!originalForm) return;

            const programTypeId = originalForm.querySelector('select[name="programTypeId"]')?.innerHTML || '';
            const sourceCode = originalForm.querySelector('textarea[name="sourceCode"]')?.value || '';
            const csrfToken = originalForm.querySelector('input[name="csrf_token"]')?.value || '';
            const ftaa = originalForm.querySelector('input[name="ftaa"]')?.value || '';
            const bfaa = originalForm.querySelector('input[name="bfaa"]')?.value || '';

            // 4. 백준 스타일 폼 HTML 구성
            const newFormHtml = `
                <div class="submit-form-container" style="margin-top: 20px;">
                    <div class="page-header"><h1 style="text-align: left; font-size: 28px;">제출</h1></div>
                    <form action="${originalForm.action}" method="POST" id="boj-submit-form">
                        <input type="hidden" name="csrf_token" value="${csrfToken}">
                        <input type="hidden" name="ftaa" value="${ftaa}">
                        <input type="hidden" name="bfaa" value="${bfaa}">
                        <input type="hidden" name="action" value="submitSolution">
                        
                        <div class="submit-form-row">
                            <div class="submit-form-label">문제</div>
                            <div class="submit-form-input-group">
                                <input type="text" name="submittedProblemCode" value="${problemId}" placeholder="예: 1890B" required style="width: 200px;">
                            </div>
                        </div>

                        <div class="submit-form-row">
                            <div class="submit-form-label">언어</div>
                            <div class="submit-form-input-group">
                                <select name="programTypeId" required style="width: 300px;">${programTypeId}</select>
                            </div>
                        </div>

                        <div class="submit-form-row" style="align-items: flex-start; margin-top: 20px;">
                            <div class="submit-form-label" style="padding-top: 10px;">소스 코드</div>
                            <div class="submit-form-input-group">
                                <textarea name="sourceCode" placeholder="코드를 여기에 붙여넣으세요" required style="height: 500px; font-family: monospace;"></textarea>
                            </div>
                        </div>

                        <div class="submit-button-container" style="margin-top: 30px;">
                            <button type="submit" class="btn-boj-submit">제출</button>
                        </div>
                    </form>
                </div>
            `;

            // 5. 기존 레이아웃 제거 및 새 폼 주입 (파일 업로드 기능 자연스럽게 삭제)
            const oldBox = document.querySelector('.roundbox');
            if (oldBox) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = newFormHtml;
                oldBox.parentNode.replaceChild(wrapper, oldBox);
                
                // 기존 텍스트 데이터 복원
                const newTextArea = document.querySelector('textarea[name="sourceCode"]');
                if (newTextArea) newTextArea.value = sourceCode;
            }

            // 불필요한 서브 메뉴 숨김 강제화
            const secondMenu = document.querySelector('.second-level-menu');
            if (secondMenu) secondMenu.style.display = 'none';
        }
    };
})();