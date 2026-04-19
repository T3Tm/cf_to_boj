window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Status = (function() {
    return {
        init: function() {
            const renderTiers = () => {
                document.querySelectorAll('.status-frame-datatable tr[data-submission-id]').forEach(row => {
                    const problemCell = row.querySelector('td:nth-child(3) a'); 
                    if (problemCell && !problemCell.querySelector('img')) {
                        const iconUrl = chrome.runtime.getURL('icons/question_mark.svg');
                        problemCell.innerHTML = `<img src="${iconUrl}" class="boj-tier-icon"> ` + problemCell.innerHTML;
                    }
                });
            };
            renderTiers();
            window.BOJ_CF.DOMObserver.init('.status-frame-datatable');
            window.BOJ_CF.DOMObserver.subscribe(renderTiers);
        }
    };
})();