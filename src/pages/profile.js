/**
 * src/pages/profile.js
 * 유저 프로필 페이지 컨트롤러 (2단 레이아웃 및 API 연동)
 */
window.BOJ_CF.Pages = window.BOJ_CF.Pages || {};

window.BOJ_CF.Pages.Profile = (function() {
    
    // 1. 프로필 기본 정보 파싱
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

    // 2. 백준 스타일 문제 목록 블록 생성
    const renderProblemBlocks = (problems, containerId, title, colorClass) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (problems.length === 0) {
            container.innerHTML = `<p style="color:#888;">데이터가 없습니다.</p>`;
            return;
        }

        const html = problems.map(id => 
            `<a href="/problemset/problem/${id.replace(/[A-Z]/g, '/$&')}" class="boj-problem-block ${colorClass}">${id}</a>`
        ).join('');
        
        container.innerHTML = html;
    };

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            const userData = parseUserData();
            if (!userData) return;

            // 3. 2단 레이아웃 UI 구조 주입 (기존 내용 대체)
            pc.innerHTML = `
                <div class="boj-profile-container">
                    <div class="boj-profile-sidebar">
                        <img src="${userData.avatar}" class="boj-avatar">
                        <div class="boj-user-info">
                            <h1>${userData.handle}</h1>
                            <p class="boj-rank">${userData.rank}</p>
                            <table class="boj-info-table">
                                <tr><th>레이팅</th><td>${userData.rating}</td></tr>
                                <tr><th>기여도</th><td>${userData.contribution}</td></tr>
                            </table>
                        </div>
                    </div>
                    <div class="boj-profile-main">
                        <div class="boj-content-section">
                            <h2>활동 현황 (스트릭)</h2>
                            <div id="boj-activity-chart">데이터를 불러오는 중...</div>
                        </div>
                        <div class="boj-content-section">
                            <h2>맞은 문제</h2>
                            <div id="boj-solved-list" class="boj-problem-list">불러오는 중...</div>
                        </div>
                        <div class="boj-content-section">
                            <h2>시도했지만 틀린 문제</h2>
                            <div id="boj-tried-list" class="boj-problem-list">불러오는 중...</div>
                        </div>
                    </div>
                </div>
            `;

            // 4. API 데이터 호출 (캐시 활용)
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

                // 5. 문제 블록 렌더링
                renderProblemBlocks(Array.from(solved).sort(), 'boj-solved-list', '맞은 문제', 'solved');
                renderProblemBlocks(Array.from(tried).sort(), 'boj-tried-list', '틀린 문제', 'tried');
                
                // 잔디(차트)는 코드포스 원본 요소를 가져오거나 라이브러리 연결 가능
                document.getElementById('boj-activity-chart').innerHTML = `<p style="color:#888;">API 연동 완료 (${solved.size} 문제 해결)</p>`;
            }
        }
    };
})();