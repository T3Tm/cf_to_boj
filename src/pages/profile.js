/**
 * src/pages/profile.js (v4.3.7)
 * [BOJ Layout] 백준 스타일 2단 레이아웃 및 문제 리스트(맞은/틀린 문제) 구현
 */
window.BOJ_CF.Pages.Profile = (function() {
    /**
     * 제출 이력을 분석하여 맞은 문제와 시도 중인 문제 목록을 산출합니다.
     */
    function analyzeStatus(result) {
        const solvedMap = new Map();
        const attemptedMap = new Map();

        if (result && Array.isArray(result)) {
            // 시간순(과거->최신)으로 분석하여 최종 상태 결정
            [...result].reverse().forEach(sub => {
                const pId = `${sub.problem.contestId}${sub.problem.index}`;
                const pObj = sub.problem;
                
                if (sub.verdict === 'OK') {
                    solvedMap.set(pId, pObj);
                    attemptedMap.delete(pId); // 맞았다면 시도 중 목록에서 제거
                } else {
                    if (!solvedMap.has(pId)) {
                        attemptedMap.set(pId, pObj);
                    }
                }
            });
        }

        // 문제 번호순 정렬
        const sorter = (a, b) => (a.contestId - b.contestId) || a.index.localeCompare(b.index);
        
        return {
            solved: Array.from(solvedMap.values()).sort(sorter),
            attempted: Array.from(attemptedMap.values()).sort(sorter)
        };
    }

    /**
     * 날짜 포맷팅 (YYYY-MM-DD)
     */
    function formatDate(seconds) {
        if (!seconds) return '-';
        const d = new Date(seconds * 1000);
        return d.toISOString().split('T')[0];
    }

    /**
     * 문제 링크 요소 생성 (티어 아이콘 포함)
     */
    function renderProblemLink(prob) {
        const pId = `${prob.contestId}${prob.index}`;
        const tierIcon = window.BOJ_CF.TierCalculator.getProblemTierIcon(prob.rating);
        const iconUrl = chrome.runtime.getURL(tierIcon);
        
        return `
            <a href="/problemset/problem/${prob.contestId}/${prob.index}" class="boj-prob-link" title="${prob.name}">
                <img src="${iconUrl}" class="boj-prob-tier">
                <span>${pId}</span>
            </a>
        `;
    }

    return {
        init: async function() {
            const handle = window.location.pathname.split('/').pop();
            const pc = document.querySelector('#pageContent');
            if (!pc || !handle) return;

            // 1. 데이터 가져오기
            const [info, status] = await Promise.all([
                window.BOJ_CF.Fetcher.fetchUserInfo(handle),
                window.BOJ_CF.Fetcher.fetchUserStatus(handle)
            ]);

            const stats = analyzeStatus(status?.result || []);
            const tierInfo = window.BOJ_CF.TierCalculator.getUserTier(info?.rating || 0);

            // 2. 기존 원본 요소 보존
            const ratingGraphTop = document.querySelector('.user-graph-container');
            const ratingGraphBottom = document.querySelector('.rating-history-table');
            const activityFrame = document.querySelector('.activity-view');

            // 3. 전체 레이아웃 구성
            pc.innerHTML = `
                <div class="boj-profile-container">
                    <!-- 왼쪽 사이드바: 유저 카드 -->
                    <aside class="boj-profile-left">
                        <div class="boj-card user-info-card">
                            <div class="user-avatar">
                                <img src="${info?.titlePhoto || info?.avatar}" alt="${handle}">
                            </div>
                            
                            <div class="user-tier-handle">
                                <div class="tier-row">
                                    <img src="${chrome.runtime.getURL(tierInfo.icon)}" alt="${tierInfo.name}" class="tier-icon">
                                    <span class="tier-name">${tierInfo.name}</span>
                                </div>
                                <h1 class="user-handle">${handle}</h1>
                                <div class="user-org">${info?.organization || '소속 없음'}</div>
                            </div>

                            <div class="user-dashboard">
                                <div class="dash-item">
                                    <span class="label">해결</span>
                                    <span class="value">${stats.solved.length}</span>
                                </div>
                                <div class="dash-item">
                                    <span class="label">기여도</span>
                                    <span class="value">${info?.contribution || 0}</span>
                                </div>
                                <div class="dash-item">
                                    <span class="label">친구</span>
                                    <span class="value">${info?.friendOfCount || 0}</span>
                                </div>
                                <div class="dash-item">
                                    <span class="label">최근 접속</span>
                                    <span class="value">${formatDate(info?.lastOnlineTimeSeconds)}</span>
                                </div>
                            </div>

                            <div class="user-meta">
                                <div class="meta-item">
                                    <span class="label">최고 레이팅</span>
                                    <span class="value">${info?.maxRating || 0} (${info?.maxRank || 'unrated'})</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">가입일</span>
                                    <span class="value">${formatDate(info?.registrationTimeSeconds)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <!-- 오른쪽 메인 영역 -->
                    <main class="boj-profile-right">
                        <!-- 레이팅 변화 창 -->
                        <section class="boj-section-window" id="boj-window-rating">
                            <div class="boj-window-header"><h2 class="boj-window-title">레이팅 변화</h2></div>
                            <div class="boj-window-body" id="boj-rating-contents"></div>
                        </section>

                        <!-- 스트릭 창 -->
                        <section class="boj-section-window" id="boj-window-streak">
                            <div class="boj-window-header"><h2 class="boj-window-title">스트릭</h2></div>
                            <div class="boj-window-body" id="boj-streak-contents"></div>
                        </section>

                        <!-- 맞은 문제 창 -->
                        <section class="boj-section-window" id="boj-window-solved">
                            <div class="boj-window-header">
                                <h2 class="boj-window-title">맞은 문제 <span class="count">${stats.solved.length}</span></h2>
                            </div>
                            <div class="boj-window-body problem-list-grid">
                                ${stats.solved.map(p => renderProblemLink(p)).join('')}
                            </div>
                        </section>

                        <!-- 시도 중인 문제 창 -->
                        <section class="boj-section-window" id="boj-window-attempted">
                            <div class="boj-window-header">
                                <h2 class="boj-window-title">시도 중인 문제 <span class="count">${stats.attempted.length}</span></h2>
                            </div>
                            <div class="boj-window-body problem-list-grid">
                                ${stats.attempted.map(p => renderProblemLink(p)).join('')}
                            </div>
                        </section>
                    </main>
                </div>
            `;

            // 4. 원본 요소 재주입
            const ratingBody = document.getElementById('boj-rating-contents');
            const streakBody = document.getElementById('boj-streak-contents');

            if (ratingGraphTop && ratingBody) {
                ratingBody.appendChild(ratingGraphTop);
                if (ratingGraphBottom) ratingBody.appendChild(ratingGraphBottom);
                window.dispatchEvent(new Event('resize'));
            }

            if (activityFrame && streakBody) {
                streakBody.appendChild(activityFrame);
            }
        }
    };
})();