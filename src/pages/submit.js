/**
 * src/pages/submit.js (v3.3.5)
 * 제출 페이지 컨트롤러 (원본 폼 프록시 방식, 탭 정렬 수정, 3차 재검토 완료)
 */
window.BOJ_CF.Pages.Submit = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const originalForm = document.querySelector('form.submit-form');
            const roundBox = document.querySelector('.roundbox');
            if (!pc || !originalForm) return;

            // [재검토 1단계: 원본 폼 보호 및 데이터 확보]
            // 원본 폼은 숨기기만 하고 제출 시 직접 사용하도록 보존
            originalForm.style.display = 'none';
            if (roundBox) roundBox.style.display = 'none';

            const programTypeIdHtml = originalForm.querySelector('select[name="programTypeId"]')?.innerHTML || '';
            const sourceCodeValue = originalForm.querySelector('textarea[name="sourceCode"]')?.value || '';

            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');
            let problemFullTitle = (contestId && problemIndex) ? `${contestId}${problemIndex}` : '';

            if (contestId && problemIndex) {
                const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
                const prob = allProbs?.problems?.find(p => p.contestId == contestId && p.index == problemIndex);
                if (prob) problemFullTitle = `${contestId}${problemIndex} - ${prob.name}`;
            }

            // [재검토 2단계: 탭 메뉴 주입 - 정렬 수정]
            if (contestId && problemIndex) {
                let existingTabs = document.querySelector('.problem-menu');
                if (!existingTabs) {
                    const tabMenu = document.createElement('ul');
                    tabMenu.className = 'nav nav-pills problem-menu';
                    // justify-content: center 제거하여 왼쪽 정렬 복구
                    tabMenu.innerHTML = `
                        <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                        <li class="active"><a href="#">제출</a></li>
                        <li><a href="/problemset/status?contestId=${contestId}&index=${problemIndex}">채점 현황</a></li>
                    `;
                    pc.prepend(tabMenu);
                }
            }

            // [재검토 3단계: 커스텀 폼 생성 및 이벤트 바인딩]
            let customContainer = document.getElementById('boj-custom-submit-container');
            if (!customContainer) {
                customContainer = document.createElement('div');
                customContainer.id = 'boj-custom-submit-container';
                pc.appendChild(customContainer);
            }

            customContainer.innerHTML = `
                <div class="submit-form-container" style="margin-top: 20px;">
                    <div class="page-header"><h1 style="text-align: left; font-size: 28px;">제출</h1></div>
                    <div id="boj-submit-proxy-form">
                        <div class="submit-form-row">
                            <div class="submit-form-label">문제</div>
                            <div class="submit-form-input-group">
                                <div style="padding: 10px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; font-weight: bold; color: #333;">
                                    ${problemFullTitle || '문제를 선택해주세요'}
                                </div>
                            </div>
                        </div>

                        <div class="submit-form-row">
                            <div class="submit-form-label">언어</div>
                            <div class="submit-form-input-group">
                                <select id="boj-proxy-lang" style="width: 100%; max-width: 400px;">
                                    ${programTypeIdHtml}
                                </select>
                            </div>
                        </div>

                        <div class="submit-form-row" style="align-items: flex-start; margin-top: 20px;">
                            <div class="submit-form-label" style="padding-top: 10px;">소스 코드</div>
                            <div class="submit-form-input-group">
                                <textarea id="boj-proxy-code" placeholder="코드를 여기에 붙여넣으세요" style="height: 500px; font-family: 'Consolas', 'Monaco', monospace; line-height: 1.5;"></textarea>
                            </div>
                        </div>

                        <div class="submit-button-container">
                            <button type="button" id="boj-btn-proxy-submit" class="btn-boj-submit">제출</button>
                        </div>
                    </div>
                </div>
            `;

            // 값 복원
            document.getElementById('boj-proxy-code').value = sourceCodeValue;

            // 실제 제출 로직: 커스텀 폼 데이터를 원본 폼에 복사 후 제출 트리거
            document.getElementById('boj-btn-proxy-submit').addEventListener('click', () => {
                const proxyLang = document.getElementById('boj-proxy-lang').value;
                const proxyCode = document.getElementById('boj-proxy-code').value;

                // 원본 폼 요소 업데이트
                const originalLang = originalForm.querySelector('select[name="programTypeId"]');
                const originalCode = originalForm.querySelector('textarea[name="sourceCode"]');
                const originalProb = originalForm.querySelector('input[name="submittedProblemCode"]');

                if (originalLang) originalLang.value = proxyLang;
                if (originalCode) originalCode.value = proxyCode;
                if (originalProb && contestId && problemIndex) originalProb.value = contestId + problemIndex;

                // 원본 폼 제출 실행
                originalForm.submit();
            });

            // 기타 불필요 요소 제거
            document.querySelector('.second-level-menu')?.style.setProperty('display', 'none', 'important');
        }
    };
})();