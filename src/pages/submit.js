/**
 * src/pages/submit.js (v3.3.6)
 * 제출 페이지 컨트롤러 (제출 버튼 정밀 트리거, 리다이렉션 유도, 3차 재검토 완료)
 */
window.BOJ_CF.Pages.Submit = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const originalForm = document.querySelector('form.submit-form');
            if (!pc || !originalForm) return;

            // [재검토 1단계: 기존 요소 정밀 제거]
            // "Submit solution", "Codeforces" 타이틀 및 중복 안내문 제거
            const redundantElements = [
                '.roundbox', 
                'h2.caption', 
                '.second-level-menu',
                '#pageContent > h2'
            ];
            redundantElements.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
            });

            // 원본 폼 데이터 및 상태 확보
            const programTypeIdHtml = originalForm.querySelector('select[name="programTypeId"]')?.innerHTML || '';
            const sourceCodeValue = originalForm.querySelector('textarea[name="sourceCode"]')?.value || '';
            const originalSubmitBtn = originalForm.querySelector('input[type="submit"], button[type="submit"]');

            const params = new URLSearchParams(window.location.search);
            const contestId = params.get('contestId');
            const problemIndex = params.get('problemIndex');
            let problemFullTitle = (contestId && problemIndex) ? `${contestId}${problemIndex}` : '';

            if (contestId && problemIndex) {
                const allProbs = await window.BOJ_CF.Fetcher.fetchAllProblems();
                const prob = allProbs?.problems?.find(p => p.contestId == contestId && p.index == problemIndex);
                if (prob) problemFullTitle = `${contestId}${problemIndex} - ${prob.name}`;
            }

            // [재검토 2단계: 탭 메뉴 구성]
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
                    pc.prepend(tabMenu);
                }
            }

            // [재검토 3단계: 커스텀 폼 생성 및 이벤트 정밀 바인딩]
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
                                <div style="padding: 12px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; font-weight: bold; color: #333;">
                                    ${problemFullTitle || '문제를 선택해주세요'}
                                </div>
                            </div>
                        </div>

                        <div class="submit-form-row">
                            <div class="submit-form-label">언어</div>
                            <div class="submit-form-input-group">
                                <select id="boj-proxy-lang" style="width: 100%; max-width: 400px; padding: 8px;">
                                    ${programTypeIdHtml}
                                </select>
                            </div>
                        </div>

                        <div class="submit-form-row" style="align-items: flex-start; margin-top: 20px;">
                            <div class="submit-form-label" style="padding-top: 10px;">소스 코드</div>
                            <div class="submit-form-input-group">
                                <textarea id="boj-proxy-code" placeholder="코드를 여기에 붙여넣으세요" style="height: 500px; font-family: 'Consolas', 'Monaco', monospace; line-height: 1.5; padding: 15px;"></textarea>
                            </div>
                        </div>

                        <div class="submit-button-container" style="margin-top: 30px; text-align: center;">
                            <button type="button" id="boj-btn-proxy-submit" class="btn-boj-submit">제출</button>
                        </div>
                    </div>
                </div>
            `;

            // 데이터 복원
            document.getElementById('boj-proxy-code').value = sourceCodeValue;

            // 정밀 제출 로직: 원본 폼의 버튼을 직접 클릭하여 검증 로직 통과 유도
            document.getElementById('boj-btn-proxy-submit').addEventListener('click', () => {
                const proxyLang = document.getElementById('boj-proxy-lang').value;
                const proxyCode = document.getElementById('boj-proxy-code').value;

                const originalLang = originalForm.querySelector('select[name="programTypeId"]');
                const originalCode = originalForm.querySelector('textarea[name="sourceCode"]');
                const originalProb = originalForm.querySelector('input[name="submittedProblemCode"]');

                if (originalLang) originalLang.value = proxyLang;
                if (originalCode) originalCode.value = proxyCode;
                if (originalProb && contestId && problemIndex) originalProb.value = contestId + problemIndex;

                // submit() 대신 click()을 사용하여 코드포스 내부 스크립트 실행 보장
                if (originalSubmitBtn) {
                    originalSubmitBtn.click();
                } else {
                    originalForm.submit();
                }
            });
        }
    };
})();