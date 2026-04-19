/**
 * scripts/ui.js
 * 공통 UI 구성 및 내비게이션 연결
 */
const UI = {
    generateHeader: (probId, activeTabIndex, iconUrl, fullTitle) => {
        let tabHtml = '';
        
        // [핵심 수정] activeTabIndex가 0 이상일 때(개별 문제, 제출, 현황 페이지)만 탭을 생성!
        // 프로필이나 전체 목록 페이지(-1)에서는 탭 자체가 아예 만들어지지 않습니다.
        if (activeTabIndex >= 0) {
            const tabs = ['문제', '제출', '채점 현황'];
            const innerTabs = tabs.map((name, idx) => {
                const activeClass = (idx === activeTabIndex) ? 'active' : '';
                // '전체번' 이라고 뜨는 것을 방지
                const content = (idx === 0) ? `<span class="tab-icon">🏆</span> ${probId !== '전체' ? probId : ''}번` : name;
                return `<div class="tab-item ${activeClass}">${content}</div>`;
            }).join('');
            tabHtml = `<div class="boj-tabs">${innerTabs}</div>`;
        }

        let titleAreaHtml = (activeTabIndex === 0) ? 
            `<div class="boj-title-area"><h1><img src="${iconUrl}" class="tier-svg-icon" alt="tier" onerror="this.style.display='none'"> ${fullTitle}</h1></div>` : '';

        const PATH = window.location.pathname;
        const isStat = PATH.includes('/status') || PATH.includes('/submissions');
        const isProb = (PATH.includes('/problemset') || PATH.includes('/problem/')) && !isStat;
        const isCont = PATH.includes('/contests') || PATH.includes('/gyms') || PATH.includes('/contest/');
        const isRank = PATH.includes('/ratings');

        const user = Utils.getCurrentUser();
        let userHtml = '';
        if (user) {
            userHtml = `
                <div class="boj-user-profile-dropdown">
                    <div class="boj-dropdown-toggle">
                        <span class="boj-username ${user.colorClass}">${user.username}</span>
                        <span class="boj-caret">▼</span>
                    </div>
                    <div class="boj-dropdown-menu">
                        <a href="/profile/${user.username}">내 정보</a>
                        <a href="/settings/general">설정</a>
                        <a href="https://codeforces.com/logout">로그아웃</a>
                    </div>
                </div>
            `;
        }

        return `
            <div class="boj-header">
                <div class="boj-header-inner">
                    <div class="boj-header-left">
                        <div class="boj-logo">CODEFORCES<br><span class="logo-sub">COMPETITIVE PROGRAMMING</span></div>
                        <ul class="boj-nav">
                            <li class="${isProb ? 'active' : ''}"><a href="/problemset">문제</a></li>
                            <li class="${isCont ? 'active' : ''}"><a href="/contests">대회</a></li>
                            <li class="${isStat ? 'active' : ''}"><a href="/problemset/status">채점 현황</a></li>
                            <li class="${isRank ? 'active' : ''}"><a href="/ratings">랭킹</a></li>
                        </ul>
                    </div>
                    ${userHtml}
                </div>
            </div>
            <div class="boj-main-container" style="padding-bottom: 0;">
                ${tabHtml}
                ${titleAreaHtml}
            </div>`;
    },
    attachNavigation: (container) => {
        const probId = Utils.getProblemId();
        const isContest = window.location.pathname.includes('/contest/');
        const parts = window.location.pathname.split('/').filter(Boolean);
        
        let contestId = "";
        for (let i = 0; i < parts.length; i++) {
            if (!isNaN(parts[i]) && parts[i].trim() !== '') {
                contestId = parts[i];
                break;
            }
        }

        let problemUrl = "/problemset";
        let submitUrl = "/problemset/submit";
        let statusUrl = "/problemset/status";

        if (contestId && probId !== "전체") {
            if (isContest) {
                problemUrl = `/contest/${contestId}/problem/${probId}`;
                submitUrl = `/contest/${contestId}/submit/${probId}`;
                statusUrl = `/contest/${contestId}/status/${probId}`;
            } else {
                problemUrl = `/problemset/problem/${contestId}/${probId}`;
                submitUrl = `/problemset/submit/${contestId}/${probId}`;
                statusUrl = `/problemset/status/${contestId}/problem/${probId}`;
            }
        } else if (contestId) {
            problemUrl = isContest ? `/contest/${contestId}` : `/problemset`;
            submitUrl = isContest ? `/contest/${contestId}/submit` : `/problemset/submit`;
            statusUrl = isContest ? `/contest/${contestId}/status` : `/problemset/status/${contestId}`;
        }

        const urls = [problemUrl, submitUrl, statusUrl];

        // 탭이 존재할 때만 이벤트 리스너 부착
        const tabs = container.querySelectorAll('.boj-tabs .tab-item');
        if (tabs.length > 0) {
            tabs.forEach((tab, idx) => {
                tab.addEventListener('click', () => { window.location.href = urls[idx]; });
            });
        }
    }
};