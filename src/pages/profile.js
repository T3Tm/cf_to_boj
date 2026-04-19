/**
 * src/pages/profile.js
 * 유저 프로필 페이지 컨트롤러 (2단 레이아웃 및 API 연동)
 */
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};
window.BOJ_CF.Pages.Profile = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const handle = document.querySelector('.userbox h1')?.innerText.trim();
            if (!pc || !handle) return;
            
            pc.innerHTML = `<div style="display:flex; gap:30px;">
                <div style="flex:1;"><div class="boj-profile-card"><h3>맞은 문제</h3><div id="boj-solved-list"></div></div></div>
                <div style="flex:1;"><div class="boj-profile-card"><h3>틀린 문제</h3><div id="boj-tried-list"></div></div></div>
            </div>`;

            const status = await window.BOJ_CF.Fetcher.fetchUserStatus(handle);
            if (status && status.result) {
                const solved = new Set(), tried = new Set();
                status.result.forEach(sub => {
                    const id = `${sub.problem.contestId}${sub.problem.index}`;
                    if (sub.verdict === 'OK') { solved.add(id); tried.delete(id); } else if (!solved.has(id)) tried.add(id);
                });
                document.getElementById('boj-solved-list').innerHTML = Array.from(solved).sort().map(id => `<a class="boj-pill solved" href="/problemset/problem/${id.replace(/[A-Z]/g, '/$&')}">${id}</a>`).join('');
                document.getElementById('boj-tried-list').innerHTML = Array.from(tried).sort().map(id => `<a class="boj-pill tried" href="/problemset/problem/${id.replace(/[A-Z]/g, '/$&')}">${id}</a>`).join('');
            }
        }
    };
})();