/**
 * scripts/status.js
 * 채점 현황 페이지 변환 로직
 */
function transformStatusPage() {
    document.querySelectorAll('#header, .menu-box, #footer, .second-level-menu, #sidebar').forEach(el => {
        if(el) el.style.display = 'none';
    });
    
    const filterBox = document.querySelector('.status-filter');

    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');
    // [수정] URL 상태와 무관하게 탭 활성화 인덱스를 무조건 2(채점 현황)로 고정
    bojContainer.innerHTML = UI.generateHeader(Utils.getProblemId(), 2, '', '');
    UI.attachNavigation(bojContainer);

    const pc = document.querySelector('#pageContent');
    if (pc) {
        pc.parentNode.insertBefore(bojContainer, pc);
        pc.classList.add('boj-main-container', 'status-mode');

        if (filterBox) {
            filterBox.classList.add('boj-status-filter');
            const walker = document.createTreeWalker(filterBox, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                node.nodeValue = node.nodeValue.replace('Contest:', '대회:').replace('Verdict:', '결과:').replace('Language:', '언어:').replace('Test:', '테스트:');
            }
            const applyBtn = filterBox.querySelector('input[value="Apply"], input[value="apply"]');
            if (applyBtn) applyBtn.value = "검색";
            
            const resetBtn = filterBox.querySelector('input[value="Reset"], input[value="reset"]');
            if (resetBtn) resetBtn.value = "초기화";

            pc.insertBefore(filterBox, pc.firstChild);
        }

        document.querySelectorAll('.status-frame-datatable th').forEach((th, idx) => {
            const headerMap = ['제출 번호', '제출한 시간', '아이디', '문제', '언어', '결과', '시간', '메모리'];
            if (headerMap[idx]) {
                const link = th.querySelector('a');
                if (link) link.innerText = headerMap[idx];
                else th.innerText = headerMap[idx];
            }
        });

        document.querySelectorAll('.status-frame-datatable tr[data-submission-id]').forEach(row => {
            const verdictCell = row.querySelector('.status-verdict-cell');
            if (verdictCell) {
                const text = verdictCell.innerText.trim();
                let res = { text: text, css: 'boj-default' };
                if (text.includes('Accepted')) res = { text: '맞았습니다!!', css: 'boj-ac' };
                else if (text.includes('Wrong answer')) res = { text: '틀렸습니다', css: 'boj-wa' };
                else if (text.includes('Time limit')) res = { text: '시간 초과', css: 'boj-tle' };
                else if (text.includes('Memory limit')) res = { text: '메모리 초과', css: 'boj-mle' };
                else if (text.includes('Runtime error')) res = { text: '런타임 에러', css: 'boj-rte' };
                else if (text.includes('Compilation error')) res = { text: '컴파일 에러', css: 'boj-ce' };
                else if (text.includes('Hacked')) res = { text: '해킹당함', css: 'boj-wa' };
                else if (text.includes('Running') || text.includes('queue')) res = { text: '채점 중...', css: 'boj-wait' };
                
                verdictCell.innerHTML = `<span class="${res.css} bold-verdict">${res.text}</span>`;
            }
            const timeCell = row.querySelector('.time-consumed-cell');
            if (timeCell) timeCell.innerHTML = timeCell.innerText.replace('ms', '<span class="unit">ms</span>');

            const memCell = row.querySelector('.memory-consumed-cell');
            if (memCell) memCell.innerHTML = memCell.innerText.replace('KB', '<span class="unit">KB</span>');
        });
    }
}