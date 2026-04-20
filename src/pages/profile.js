/**
 * src/pages/profile.js (v3.2)
 * 유저 프로필 페이지 컨트롤러 (비파괴적 BOJ 스타일 레이아웃 추가)
 */
window.BOJ_CF.Pages.Profile = (function() {
    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const userbox = document.querySelector('.userbox');
            if (!pc || !userbox) return;

            // 기존 내용 아래에 BOJ 스타일 섹션 추가
            let bojSection = document.getElementById('boj-profile-sections');
            if (!bojSection) {
                bojSection = document.createElement('div');
                bojSection.id = 'boj-profile-sections';
                bojSection.style.marginTop = '30px';
                bojSection.innerHTML = `
                    <div style="display:flex; gap:30px; flex-wrap: wrap;">
                        <div style="flex:1; min-width: 300px;"><div class="boj-profile-card"><h3>맞은 문제</h3><div id="boj-solved-list"></div></div></div>
                        <div style="flex:1; min-width: 300px;"><div class="boj-profile-card"><h3>시도 중인 문제</h3><div id="boj-tried-list"></div></div></div>
                    </div>
                `;
                pc.appendChild(bojSection);
            }

            const handle = userbox.querySelector('h1')?.innerText.trim();
            if (!handle) return;

            const status = await window.BOJ_CF.Fetcher.fetchUserStatus(handle);
            if (status && status.result) {
                const solved = new Set(), tried = new Set();
                status.result.forEach(sub => {
                    const id = `${sub.problem.contestId}${sub.problem.index}`;
                    if (sub.verdict === 'OK') { 
                        solved.add(id); tried.delete(id); 
                    } else if (!solved.has(id)) {
                        tried.add(id);
                    }
                });
                
                const formatId = (id) => `<a class="boj-pill ${solved.has(id) ? 'solved' : 'tried'}" href="/problemset/problem/${id.replace(/([A-Z])/g, '/$1')}" style="margin: 2px; display: inline-block;">${id}</a>`;
                
                document.getElementById('boj-solved-list').innerHTML = Array.from(solved).sort().map(formatId).join('');
                document.getElementById('boj-tried-list').innerHTML = Array.from(tried).sort().map(formatId).join('');
            }
        }
    };
})();