/**
 * src/pages/profile.js (v4.1.0)
 * [Frozen Design] 유저 프로필 페이지 컨트롤러 (BOJ 오리지널 스타일 재현)
 */
window.BOJ_CF.Pages.Profile = (function() {
    /**
     * 제출 데이터를 분석하여 통계를 생성합니다.
     */
    function analyzeStatus(result) {
        const solved = new Set();
        const tried = new Set();
        const verdicts = {
            OK: 0, WA: 0, TLE: 0, MLE: 0, RE: 0, CE: 0, OTHER: 0
        };

        result.forEach(sub => {
            const id = `${sub.problem.contestId}${sub.problem.index}`;
            if (sub.verdict === 'OK') {
                verdicts.OK++;
                solved.add(id);
                tried.delete(id);
            } else {
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
            if (!pc) return;

            // 1. 유저 정보 추출
            const handleEl = document.querySelector('.userbox h1 a');
            if (!handleEl) return;
            const handle = handleEl.innerText.trim();
            
            const ratingEl = document.querySelector('.userbox li span[style*="font-weight:bold"]') || 
                             document.querySelector('.userbox .user-gray') || 
                             document.querySelector('.userbox .user-green');
            const rating = ratingEl ? parseInt(ratingEl.innerText.replace(/[^0-9]/g, '')) : 0;

            // 2. 데이터 페칭
            const statusRes = await window.BOJ_CF.Fetcher.fetchUserStatus(handle);
            if (!statusRes || !statusRes.result) return;

            const stats = analyzeStatus(statusRes.result);
            const solveRate = stats.total > 0 ? ((stats.verdicts.OK / stats.total) * 100).toFixed(2) : "0.00";

            // 3. 레이아웃 초기화
            pc.innerHTML = '';
            
            // [상단] 프로필 헤더
            const tierIcon = window.BOJ_CF.TierCalculator.getUserTierIcon(rating);
            const header = document.createElement('div');
            header.className = 'boj-profile-header';
            header.innerHTML = `
                <div class="boj-profile-id-row">
                    <img src="${chrome.runtime.getURL(tierIcon)}" class="boj-tier-main">
                    <h1 style="color: var(--text-main);">${handle}</h1>
                </div>
            `;
            pc.appendChild(header);

            // [중앙] 2단 통계 레이아웃 (Utility Classes 적용)
            const mainRow = document.createElement('div');
            mainRow.className = 'boj-row mt-20';
            mainRow.innerHTML = `
                <div class="boj-col-4">
                    <table class="boj-table" id="statics">
                        <tbody>
                            <tr><th style="width:50%;">등수</th><td>-</td></tr>
                            <tr><th>맞은 문제</th><td class="text-primary" style="font-weight: bold;">${stats.solved.size}</td></tr>
                            <tr><th>시도했지만 맞지 못한 문제</th><td class="text-danger" style="font-weight: bold;">${stats.tried.size}</td></tr>
                            <tr><th>제출</th><td>${stats.total}</td></tr>
                            <tr><th>정답 비율</th><td>${solveRate}%</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="boj-col-8">
                    <div class="boj-panel">
                        <div class="boj-panel-header">채점 결과 통계</div>
                        <div class="boj-panel-body" style="padding:0;">
                            <table class="boj-table" style="border:none;">
                                <thead>
                                    <tr>
                                        <th class="verdict-ac">맞았습니다</th>
                                        <th class="verdict-wa">틀렸습니다</th>
                                        <th class="verdict-tle">시간 초과</th>
                                        <th class="verdict-mle">메모리 초과</th>
                                        <th class="verdict-re">런타임 에러</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="text-align: center; font-weight: bold;">
                                        <td class="verdict-ac">${stats.verdicts.OK}</td>
                                        <td class="verdict-wa">${stats.verdicts.WA}</td>
                                        <td class="verdict-tle">${stats.verdicts.TLE}</td>
                                        <td class="verdict-mle">${stats.verdicts.MLE}</td>
                                        <td class="verdict-re">${stats.verdicts.RE}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            pc.appendChild(mainRow);

            // [하단] 문제 리스트 섹션
            const listSection = document.createElement('div');
            listSection.className = 'boj-profile-lists mt-40';
            
            const solvedHtml = Array.from(stats.solved).sort((a,b) => parseInt(a)-parseInt(b)).map(id => {
                const match = id.match(/([0-9]+)([A-Z][0-9]*)/);
                const [cId, pIdx] = match ? [match[1], match[2]] : [id.slice(0,-1), id.slice(-1)];
                return `<a href="/problemset/problem/${cId}/${pIdx}">${id}</a>`;
            }).join(' ');

            listSection.innerHTML = `
                <div class="problem-list-wrapper">
                    <div class="boj-headline"><h2>맞은 문제</h2></div>
                    <div class="problem-list">${solvedHtml || '없음'}</div>
                </div>
                <div class="problem-list-wrapper mt-40">
                    <div class="boj-headline"><h2>시도했지만 맞지 못한 문제</h2></div>
                    <div class="problem-list">
                        ${Array.from(stats.tried).sort().map(id => {
                            const match = id.match(/([0-9]+)([A-Z][0-9]*)/);
                            const [cId, pIdx] = match ? [match[1], match[2]] : [id.slice(0,-1), id.slice(-1)];
                            return `<a href="/problemset/problem/${cId}/${pIdx}" style="color: var(--brand-danger);">${id}</a>`;
                        }).join(' ') || '없음'}
                    </div>
                </div>
            `;
            pc.appendChild(listSection);
        }
    };
})();