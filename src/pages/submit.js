/**
 * src/pages/submit.js (v3.3.4)
 * 제출 페이지 컨트롤러 (단일 폼 통합, 문제 제목 자동 완성, 3차 재검토 완료)
 */
window.BOJ_CF.Pages.Submit = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            // [재검토 1단계: 기존 폼 제거 및 데이터 확보]
            const originalForm = document.querySelector('form.submit-form');
            const roundBox = document.querySelector('.roundbox');
            if (!originalForm) return;

            // 기존 폼 데이터 안전하게 추출
            const programTypeIdHtml = originalForm.querySelector('select[name="programTypeId"]')?.innerHTML || '';
            const sourceCodeValue = originalForm.querySelector('textarea[name="sourceCode"]')?.value || '';
            const csrfToken = originalForm.querySelector('input[name="csrf_token"]')?.value || '';
            const ftaa = originalForm.querySelector('input[name="ftaa"]')?.value || '';
            const bfaa = originalForm.querySelector('input[name="bfaa"]')?.value || '';
            const actionUrl = originalForm.action;

            // [재검토 2단계: 문제 정보 추출 및 제목 조회]
            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');
            let problemFullTitle = (contestId && problemIndex) ? `${contestId}${problemIndex}` : '';

            if (contestId && problemIndex) {
                const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
                const prob = allProbs?.problems?.find(p => p.contestId == contestId && p.index == problemIndex);
                if (prob) {
                    problemFullTitle = `${contestId}${problemIndex} - ${prob.name}`;
                }
            }

            // [재검토 3단계: 화면 재구성 - 중복 방지]
            // 기존 roundbox 및 폼 요소들을 모두 숨김 처리하여 중복 노출 차단
            if (roundBox) roundBox.style.display = 'none';
            originalForm.style.display = 'none';
            document.querySelectorAll('.roundbox').forEach(el => el.style.display = 'none');

            // 탭 메뉴 생성 및 주입
            if (contestId && problemIndex) {
                let existingTabs = document.querySelector('.problem-menu');
                if (!existingTabs) {
                    const tabMenu = document.createElement('ul');
                    tabMenu.className = 'nav nav-pills problem-menu';
                    tabMenu.style.justifyContent = 'center';
                    tabMenu.innerHTML = `
                        <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                        <li class="active"><a href="#">제출</a></li>
                        <li><a href="/problemset/status?contestId=${contestId}&index=${problemIndex}">채점 현황</a></li>
                    `;
                    pc.prepend(tabMenu);
                }
            }

            // 새 폼 컨테이너 생성
            let customFormContainer = document.getElementById('boj-custom-submit-container');
            if (!customFormContainer) {
                customFormContainer = document.createElement('div');
                customFormContainer.id = 'boj-custom-submit-container';
                pc.appendChild(customFormContainer);
            }

            customFormContainer.innerHTML = `
                <div class="submit-form-container">
                    <div class="page-header"><h1 style="text-align: left; font-size: 28px;">제출</h1></div>
                    <form action="${actionUrl}" method="POST" id="boj-submit-form">
                        <input type="hidden" name="csrf_token" value="${csrfToken}">
                        <input type="hidden" name="ftaa" value="${ftaa}">
                        <input type="hidden" name="bfaa" value="${bfaa}">
                        <input type="hidden" name="action" value="submitSolution">
                        
                        <div class="submit-form-row">
                            <div class="submit-form-label">문제</div>
                            <div class="submit-form-input-group">
                                <input type="text" name="submittedProblemCode" value="${contestId && problemIndex ? contestId + problemIndex : ''}" style="display:none;">
                                <div style="padding: 10px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; font-weight: bold; color: #333;">
                                    ${problemFullTitle || '문제를 선택해주세요'}
                                </div>
                            </div>
                        </div>

                        <div class="submit-form-row">
                            <div class="submit-form-label">언어</div>
                            <div class="submit-form-input-group">
                                <select name="programTypeId" required style="width: 100%; max-width: 400px;">
                                    ${programTypeIdHtml}
                                </select>
                            </div>
                        </div>

                        <div class="submit-form-row" style="align-items: flex-start; margin-top: 20px;">
                            <div class="submit-form-label" style="padding-top: 10px;">소스 코드</div>
                            <div class="submit-form-input-group">
                                <textarea name="sourceCode" placeholder="코드를 여기에 붙여넣으세요" required style="height: 500px; font-family: 'Consolas', 'Monaco', monospace; line-height: 1.5;"></textarea>
                            </div>
                        </div>

                        <div class="submit-button-container">
                            <button type="submit" class="btn-boj-submit">제출</button>
                        </div>
                    </form>
                </div>
            `;

            // 소스 코드 값 복원
            const newTextArea = customFormContainer.querySelector('textarea[name="sourceCode"]');
            if (newTextArea) newTextArea.value = sourceCodeValue;

            // 서브 메뉴 숨김
            const secondMenu = document.querySelector('.second-level-menu');
            if (secondMenu) secondMenu.style.setProperty('display', 'none', 'important');
        }
    };
})();