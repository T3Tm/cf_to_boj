window.BOJ_CF.Pages.Status = (function() {
    const renderTiers = () => {
        const rows = document.querySelectorAll('.status-frame-datatable tr[data-submission-id]');
        rows.forEach(row => {
            // 제출번호가 아닌 3번째 열의 문제 이름 타겟팅
            const problemCell = row.querySelector('td:nth-child(3) a'); 
            if (problemCell && !problemCell.querySelector('img')) {
                const iconUrl = chrome.runtime.getURL('icons/question_mark.svg');
                problemCell.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon"> ` + problemCell.innerHTML;
            }
        });
    };

    return {
        init: function() {
            renderTiers();
            window.BOJ_CF.DOMObserver.init('.status-frame-datatable');
            window.BOJ_CF.DOMObserver.subscribe(renderTiers);
        }
    };
})();