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
            
            // 레이팅 추출 (여러 위치 시도)
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
                    <h1>${handle}</h1>
                </div>
            `;
            pc.appendChild(header);

            // [중앙] 2단 통계 레이아웃
            const mainRow = document.createElement('div');
            mainRow.className = 'row';
            mainRow.style.marginTop = '20px';
            mainRow.innerHTML = `
                <div class="col-md-4">
                    <table class="table table-bordered" id="statics">
                        <tbody>
                            <tr><th style="width:50%;">등수</th><td>-</td></tr>
                            <tr><th>맞은 문제</th><td style="color: var(--boj-primary); font-weight: bold;">${stats.solved.size}</td></tr>
                            <tr><th>시도했지만 맞지 못한 문제</th><td style="color: var(--boj-danger); font-weight: bold;">${stats.tried.size}</td></tr>
                            <tr><th>제출</th><td>${stats.total}</td></tr>
                            <tr><th>정답 비율</th><td>${solveRate}%</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-8">
                    <div class="panel panel-default">
                        <div class="panel-heading"><h3 class="panel-title">채점 결과 통계</h3></div>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th class="result-ac">맞았습니다</th>
                                    <th class="result-wa">틀렸습니다</th>
                                    <th class="result-tle">시간 초과</th>
                                    <th class="result-mle">메모리 초과</th>
                                    <th class="result-re">런타임 에러</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="text-align: center;">
                                    <td class="result-ac">${stats.verdicts.OK}</td>
                                    <td class="result-wa">${stats.verdicts.WA}</td>
                                    <td class="result-tle">${stats.verdicts.TLE}</td>
                                    <td class="result-mle">${stats.verdicts.MLE}</td>
                                    <td class="result-re">${stats.verdicts.RE}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            pc.appendChild(mainRow);

            // [하단] 문제 리스트 섹션 (맞은 문제 / 시도 중인 문제)
            const listSection = document.createElement('div');
            listSection.className = 'boj-profile-lists';
            listSection.style.marginTop = '30px';
            
            // 맞은 문제
            const solvedHtml = Array.from(stats.solved).sort((a,b) => parseInt(a)-parseInt(b)).map(id => {
                const match = id.match(/([0-9]+)([A-Z][0-9]*)/);
                const [cId, pIdx] = match ? [match[1], match[2]] : [id.slice(0,-1), id.slice(-1)];
                return `<a href="/problemset/problem/${cId}/${pIdx}">${id}</a>`;
            }).join(' ');

            listSection.innerHTML = `
                <div class="problem-list-wrapper">
                    <div class="headline"><h2>맞은 문제</h2></div>
                    <div class="problem-list">${solvedHtml || '없음'}</div>
                </div>
                <div class="problem-list-wrapper" style="margin-top:40px;">
                    <div class="headline"><h2>시도했지만 맞지 못한 문제</h2></div>
                    <div class="problem-list">
                        ${Array.from(stats.tried).sort().map(id => {
                            const match = id.match(/([0-9]+)([A-Z][0-9]*)/);
                            const [cId, pIdx] = match ? [match[1], match[2]] : [id.slice(0,-1), id.slice(-1)];
                            return `<a href="/problemset/problem/${cId}/${pIdx}" style="color: #c7254e;">${id}</a>`;
                        }).join(' ') || '없음'}
                    </div>
                </div>
            `;
            pc.appendChild(listSection);

            console.log(`[BOJ_CF] Profile remastered.`);
        }
    };
})();