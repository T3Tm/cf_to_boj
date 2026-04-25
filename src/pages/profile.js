/**
 * src/pages/profile.js (v4.3.0)
 * [Logic] 유저 프로필 고도화 및 상세 정보 연동 (4-2, 4-3 준수)
 */
window.BOJ_CF.Pages.Profile = (function() {
    function analyzeStatus(result) {
        const solved = new Set();
        const tried = new Set();
        const verdicts = { OK: 0, WA: 0, TLE: 0, MLE: 0, RE: 0, CE: 0, OTHER: 0 };
        result.forEach(sub => {
            const id = `${sub.problem.contestId}${sub.problem.index}`;
            if (sub.verdict === 'OK') { verdicts.OK++; solved.add(id); tried.delete(id); }
            else {
                if (sub.verdict === 'WRONG_ANSWER') verdicts.WA++;
                else if (sub.verdict === 'TIME_LIMIT_EXCEEDED') verdicts.TLE++;
                else if (sub.verdict === 'MEMORY_LIMIT_EXCEEDED') verdicts.MLE++;
                else if (sub.verdict === 'RUNTIME_ERROR') verdicts.RE++;
                else if (sub.verdict === 'COMPILATION_ERROR') verdicts.CE++;
                else verdicts.OTHER++;
                if (!solved.has(id)) tried.add(id);
            }
        });
        return { solved, tried, verdicts, total: result.length };
    }

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            const handleEl = document.querySelector('.userbox h1 a');
            if (!pc || !handleEl) return;
            const handle = handleEl.innerText.trim();
            
            // 데이터 페칭 (상세 정보 + 상태)
            const [userInfo, statusRes] = await Promise.all([
                window.BOJ_CF.Fetcher.fetchUserInfo(handle),
                window.BOJ_CF.Fetcher.fetchUserStatus(handle)
            ]);

            if (!userInfo || !statusRes) return;

            const stats = analyzeStatus(statusRes.result);
            const solveRate = stats.total > 0 ? ((stats.verdicts.OK / stats.total) * 100).toFixed(2) : "0.00";
            const tierIcon = window.BOJ_CF.TierCalculator.getUserTierIcon(userInfo.rating || 0);

            pc.innerHTML = `
                <div class="boj-profile-header">
                    <div class="boj-profile-id-row">
                        <img src="${chrome.runtime.getURL(tierIcon)}" class="boj-tier-main">
                        <h1>${handle}</h1>
                    </div>
                </div>
                <div class="boj-row mt-20">
                    <div class="boj-col-3">
                        <div class="boj-panel">
                            <div class="boj-panel-header">정보</div>
                            <div class="boj-panel-body">
                                <ul class="boj-profile-info-list" style="list-style:none; padding:0; margin:0;">
                                    <li><strong>레이팅:</strong> <span style="color:var(--boj-primary);">${userInfo.rating || 0}</span></li>
                                    <li><strong>최고 기록:</strong> ${userInfo.maxRating || 0}</li>
                                    <li><strong>기여도:</strong> ${userInfo.contribution || 0}</li>
                                    <li><strong>친구 수:</strong> ${userInfo.friendOfCount || 0}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="boj-col-9">
                        <table class="boj-table" style="margin-bottom:20px;">
                            <tbody>
                                <tr><th style="width:20%;">제출</th><td style="width:30%;">${stats.total}</td><th style="width:20%;">맞은 문제</th><td style="width:30%;" class="text-primary"><strong>${stats.solved.size}</strong></td></tr>
                                <tr><th>맞지 못한 문제</th><td class="text-danger">${stats.tried.size}</td><th>정답 비율</th><td>${solveRate}%</td></tr>
                            </tbody>
                        </table>
                        
                        <div class="problem-list-wrapper mt-20">
                            <div class="boj-headline"><h2>맞은 문제</h2></div>
                            <div class="problem-list">
                                ${Array.from(stats.solved).sort().map(id => {
                                    const match = id.match(/([0-9]+)([A-Z][0-9]*)/);
                                    return `<a href="/problemset/problem/${match[1]}/${match[2]}">${id}</a>`;
                                }).join(' ')}
                            </div>
                        </div>
                        <div class="problem-list-wrapper mt-40">
                            <div class="boj-headline"><h2>시도했지만 맞지 못한 문제</h2></div>
                            <div class="problem-list">
                                ${Array.from(stats.tried).sort().map(id => {
                                    const match = id.match(/([0-9]+)([A-Z][0-9]*)/);
                                    return `<a href="/problemset/problem/${match[1]}/${match[2]}" class="text-danger">${id}</a>`;
                                }).join(' ')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    };
})();