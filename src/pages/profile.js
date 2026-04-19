/**
 * src/pages/profile.js
 * 유저 프로필 페이지 컨트롤러 (2단 레이아웃 및 API 연동)
 */
window.BOJ_CF.Pages.Profile = (function() {
    
    const parseUserData = () => {
        const infoDiv = document.querySelector('.userbox');
        if (!infoDiv) return null;

        return {
            handle: infoDiv.querySelector('h1')?.innerText.trim() || 'Unknown',
            rank: infoDiv.querySelector('.user-rank')?.innerText.trim() || 'Unrated',
            rating: infoDiv.querySelector('span[style*="font-weight:bold"]')?.innerText.trim() || '0',
            avatar: document.querySelector('.title-photo img')?.src || '',
            contribution: infoDiv.innerText.match(/Contribution: ([+-]?\d+)/)?.[1] || '0'
        };
    };

    const renderProblemBlocks = (problems, containerId, colorClass) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (problems.length === 0) {
            container.innerHTML = `<p style="color:#888;">데이터가 없습니다.</p>`;
            return;
        }

        container.innerHTML = problems.map(id => 
            `<a href="/problemset/problem/${id.replace(/[A-Z]/g, '/$&')}" class="boj-pill ${colorClass}" style="text-decoration:none;">${id}</a>`
        ).join('');
    };

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            const userData = parseUserData();
            if (!userData) return;

            // 프로필 전용 2단 레이아웃 주입 (components.css에 스타일 병합됨)
            pc.innerHTML = `
                <div style="display:flex; gap:30px; margin-top:20px;">
                    <div style="width:280px;">
                        <img src="${userData.avatar}" style="width:100%; border-radius:8px; border:1px solid var(--boj-border);">
                        <div style="margin-top:15px; color:var(--boj-text);">
                            <h1 style="margin:0;">${userData.handle}</h1>
                            <p style="margin:5px 0; color:#888;">${userData.rank}</p>
                            <div style="margin-top:15px; padding:10px; border:1px solid var(--boj-border); border-radius:4px;">
                                <strong>레이팅:</strong> ${userData.rating}<br>
                                <strong>기여도:</strong> ${userData.contribution}
                            </div>
                        </div>
                    </div>
                    <div style="flex:1;">
                        <div style="background:var(--boj-bg); border:1px solid var(--boj-border); padding:20px; border-radius:4px; margin-bottom:20px;">
                            <h2 style="margin-top:0; border-bottom:1px solid var(--boj-border); padding-bottom:10px; color:var(--boj-text);">맞은 문제</h2>
                            <div id="boj-solved-list" style="display:flex; flex-wrap:wrap; gap:5px;">데이터를 불러오는 중...</div>
                        </div>
                        <div style="background:var(--boj-bg); border:1px solid var(--boj-border); padding:20px; border-radius:4px;">
                            <h2 style="margin-top:0; border-bottom:1px solid var(--boj-border); padding-bottom:10px; color:var(--boj-text);">틀린 문제</h2>
                            <div id="boj-tried-list" style="display:flex; flex-wrap:wrap; gap:5px;">데이터를 불러오는 중...</div>
                        </div>
                    </div>
                </div>
            `;

            const statusData = await window.BOJ_CF.Fetcher.fetchUserStatus(userData.handle);
            if (statusData && statusData.result) {
                const solved = new Set();
                const tried = new Set();

                statusData.result.forEach(sub => {
                    const probId = `${sub.problem.contestId}${sub.problem.index}`;
                    if (sub.verdict === 'OK') {
                        solved.add(probId);
                        tried.delete(probId);
                    } else if (!solved.has(probId)) {
                        tried.add(probId);
                    }
                });

                renderProblemBlocks(Array.from(solved).sort(), 'boj-solved-list', 'solved');
                renderProblemBlocks(Array.from(tried).sort(), 'boj-tried-list', 'tried');
            }
        }
    };
})();