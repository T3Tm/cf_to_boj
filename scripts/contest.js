/**
 * scripts/contest.js
 * 대회(Contests) 및 연습(Gym) 페이지 변환 로직
 */
function transformContestPage() {
    document.querySelectorAll('#header, .menu-box, #footer, .second-level-menu, #sidebar').forEach(el => {
        if(el) el.style.display = 'none';
    });

    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');
    bojContainer.innerHTML = UI.generateHeader("대회", -1, '', '');

    const problemTabs = bojContainer.querySelector('.boj-tabs');
    if (problemTabs) problemTabs.style.display = 'none';

    UI.attachNavigation(bojContainer); 

    const pc = document.querySelector('#pageContent');
    if (pc) {
        pc.parentNode.insertBefore(bojContainer, pc);
        pc.classList.add('boj-main-container', 'contest-mode');

        const isGym = window.location.pathname.includes('/gyms');
        const pillsHtml = `
            <ul class="boj-nav-pills">
                <li class="${!isGym ? 'active' : ''}"><a href="/contests">공식 (Codeforces)</a></li>
                <li class="${isGym ? 'active' : ''}"><a href="/gyms">연습 (Gym)</a></li>
            </ul>
        `;
        pc.insertAdjacentHTML('afterbegin', pillsHtml);

        document.querySelectorAll('.datatable').forEach(dt => {
            dt.style.backgroundColor = 'transparent';
            dt.style.padding = '0';
            dt.querySelectorAll('.lt, .rt, .lb, .rb, .ilt, .irt').forEach(el => el.style.display = 'none');

            const titleDiv = dt.querySelector('div[style*="padding: 4px"]');
            if (titleDiv) {
                titleDiv.className = 'boj-table-title';
                titleDiv.style = '';
                if (titleDiv.innerHTML.includes('Current or upcoming contests')) {
                    titleDiv.innerHTML = titleDiv.innerHTML.replace('Current or upcoming contests', '현재 또는 예정된 대회');
                }
                if (titleDiv.innerHTML.includes('Past contests')) {
                    titleDiv.innerHTML = titleDiv.innerHTML.replace('Past contests', '종료된 대회');
                }
            }

            const table = dt.querySelector('table');
            if (table) {
                table.classList.add('boj-table');
                table.querySelectorAll('th').forEach(th => {
                    th.className = ''; 
                    th.style = ''; 
                    if (th.innerText.includes('Name')) th.innerText = '대회 이름';
                    if (th.innerText.includes('Writers')) th.innerText = '출제자';
                    if (th.innerText.includes('Start')) th.innerText = '시작';
                    if (th.innerText.includes('Length')) th.innerText = '길이';
                });
                table.querySelectorAll('td').forEach(td => {
                    td.className = '';
                });
            }
        });
        
        document.querySelectorAll('.pagination').forEach(p => p.style.marginTop = '30px');
    }
}