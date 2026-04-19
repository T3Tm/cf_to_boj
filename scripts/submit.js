/**
 * scripts/submit.js
 * 소스 코드 제출 페이지 변환 로직
 */
function transformSubmitPage() {
    document.querySelectorAll('#header, .menu-box, #sidebar, #footer, .second-level-menu').forEach(el => el.style.display = 'none');

    let contestName = "";
    document.querySelectorAll('#pageContent > div, #pageContent > center').forEach(el => {
        const text = el.innerText.trim();
        // [수정] 제출 버튼 자체가 담긴 구역을 숨기지 않도록 예외 처리
        if ((text.includes('Submit solution') || text.includes('코드 제출') || text.includes('Round')) && !el.querySelector('input[type="submit"]')) {
            const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
            contestName = lines.find(l => l.includes('Round') || l.includes('Div.')) || contestName;
            el.style.display = 'none';
        }
    });

    document.querySelectorAll('table.table-form tr').forEach(row => {
        // [수정] 텍스트가 없더라도 버튼이나 폼 요소(input, select)가 있으면 절대 숨기지 않음!
        if (row.innerText.trim() === '' && !row.querySelector('input, select, textarea')) {
            row.style.display = 'none';
            return;
        }
        
        const labelTd = row.querySelector('td:first-child');
        const valTd = row.querySelector('td:nth-child(2)');
        if (labelTd?.innerText.includes('Problem') && valTd && !valTd.querySelector('select') && contestName) {
            valTd.innerText = `${contestName} ${valTd.innerText.trim()}`;
            valTd.style.fontWeight = "bold";
        }
    });

    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');
    bojContainer.innerHTML = UI.generateHeader(Utils.getProblemId(), 1, '', '');
    UI.attachNavigation(bojContainer);

    const pc = document.querySelector('#pageContent');
    if (pc) {
        pc.parentNode.insertBefore(bojContainer, pc);
        pc.classList.add('boj-main-container', 'submit-mode');
    }
}