/**
 * scripts/profile.js
 * 유저 프로필 페이지 변환 로직 (백준 스타일 2단 레이아웃 + API 연동)
 */
function transformProfilePage() {
    document.querySelectorAll('#header, .menu-box, #footer, .second-level-menu').forEach(el => {
        if(el) el.style.display = 'none';
    });

    const bojContainer = document.createElement('div');
    bojContainer.classList.add('boj-wrapper');
    bojContainer.innerHTML = UI.generateHeader("", -1, '', '');

    const problemTabs = bojContainer.querySelector('.boj-tabs');
    if (problemTabs) problemTabs.style.display = 'none';

    UI.attachNavigation(bojContainer);

    const pc = document.querySelector('#pageContent');
    if (!pc) return;

    pc.parentNode.insertBefore(bojContainer, pc);
    pc.classList.add('boj-main-container', 'profile-mode');

    let username = "Unknown";
    let colorClass = "user-black";
    let avatarImg = "";
    let currentRating = "0";
    let maxRating = "0";
    let maxRank = "Unrated";
    let contribution = "0";
    let friendOf = "0";

    const infoDiv = document.querySelector('.info');
    if (infoDiv) {
        const mainTitle = infoDiv.querySelector('.main-info h1');
        if (mainTitle) {
            username = mainTitle.innerText.trim();
            const aTag = mainTitle.querySelector('a');
            if (aTag) {
                colorClass = Array.from(aTag.classList).find(c => c.startsWith('user-')) || 'user-black';
            }
        }
        avatarImg = document.querySelector('.title-photo img')?.src || '';

        infoDiv.querySelectorAll('ul li').forEach(li => {
            const text = li.innerText;
            if (text.includes('Contest rating:')) {
                const match = text.match(/Contest rating:\s*(\d+)/);
                if (match) currentRating = match[1];
                const maxMatch = text.match(/\(max\.\s*([^,]+),\s*(\d+)\)/);
                if(maxMatch) {
                    maxRank = maxMatch[1].trim();
                    maxRating = maxMatch[2];
                }
            }
            if (text.includes('Contribution:')) contribution = text.replace('Contribution:', '').trim();
            if (text.includes('Friend of:')) friendOf = text.replace('Friend of:', '').replace('users', '').trim();
        });
    } else {
        const parts = window.location.pathname.split('/').filter(Boolean);
        if(parts.length > 1) username = parts[1];
    }

    const activityWrapper = document.querySelector('._UserActivityFrame_frame');
    const ratingGraph = document.getElementById('usersRatingGraphPlaceholder'); 
    
    let solvedCount = "0";
    const counters = document.querySelectorAll('._UserActivityFrame_counter');
    counters.forEach(c => {
        if(c.innerText.includes('all time')) {
            const valDiv = c.querySelector('._UserActivityFrame_counterValue');
            if(valDiv) solvedCount = valDiv.innerText.replace(/[^0-9]/g, '');
        }
    });

    let solvedHtml = '';
    if (username !== "Unknown") {
        solvedHtml = `
            <div id="boj-solved-problems-container" class="boj-solved-container">
                <span style="color:#888; font-size:14px;">데이터를 불러오는 중입니다...</span>
            </div>
            <p class="boj-sub-text" style="margin-top: 10px;">
                <a href="/submissions/${username}" class="boj-solved-link">전체 채점 현황 보기 (${solvedCount}개)</a>
            </p>
        `;
    }

    // 유저 프로필 난이도 아이콘 호출
    const iconUrl = chrome.runtime.getURL(Utils.getUserTierIcon(currentRating));

    const profileHtml = `
        <div class="boj-profile-header">
            <img src="${iconUrl}" class="boj-profile-tier-icon" alt="tier" onerror="this.style.display='none'">
            <h1 class="boj-profile-username ${colorClass}">${username}</h1>
        </div>

        <div class="boj-profile-layout">
            <div class="boj-profile-sidebar">
                ${avatarImg ? `<img src="${avatarImg}" class="boj-profile-avatar" alt="profile_image">` : ''}
                <table class="boj-profile-table">
                    <tbody>
                        <tr><th>현재 레이팅</th><td><span class="${colorClass}" style="font-weight:bold;">${currentRating}</span></td></tr>
                        <tr><th>최고 기록</th><td>${maxRating} <span class="boj-sub-text">(${maxRank})</span></td></tr>
                        <tr><th>기여도</th><td style="color: #009874; font-weight:bold;">${contribution}</td></tr>
                        <tr><th>팔로워</th><td>${friendOf} 명</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="boj-profile-main">
                <div class="boj-panel">
                    <div class="boj-panel-header">활동 현황 (Activity)</div>
                    <div class="boj-panel-body" id="boj-activity-container" style="min-height: 180px;"></div>
                </div>

                <div class="boj-panel">
                    <div class="boj-panel-header">레이팅 변화 (Rating Graph)</div>
                    <div class="boj-panel-body" id="boj-rating-container" style="min-height: 300px; position:relative; overflow:visible;"></div>
                </div>

                <div class="boj-panel">
                    <div class="boj-panel-header">맞은 문제</div>
                    <div class="boj-panel-body">
                        ${solvedHtml || '<span style="color:#888;">맞은 문제 정보를 불러올 수 없습니다.</span>'}
                    </div>
                </div>
                
                <div class="boj-panel">
                    <div class="boj-panel-header">시도했지만 맞지 못한 문제</div>
                    <div class="boj-panel-body" id="boj-attempted-problems-container">
                        <span style="color:#888; font-size:14px;">데이터를 불러오는 중입니다...</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = profileHtml;
    
    const userbox = document.querySelector('.userbox');
    if (userbox) {
        const roundBox = userbox.closest('.roundbox');
        if (roundBox) {
            roundBox.style.display = 'none';
            roundBox.parentNode.insertBefore(contentWrapper, roundBox);
        } else {
            userbox.parentNode.insertBefore(contentWrapper, userbox);
            userbox.style.display = 'none';
        }
    } else {
        pc.insertAdjacentElement('afterbegin', contentWrapper);
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';
    
    document.querySelectorAll('#pageContent > .roundbox').forEach(rb => { rb.style.display = 'none'; });

    if (activityWrapper) document.getElementById('boj-activity-container').appendChild(activityWrapper);
    if (ratingGraph) {
        const graphParent = ratingGraph.closest('.roundbox') || ratingGraph.parentNode;
        if(graphParent) {
            graphParent.style.display = 'block';
            graphParent.style.border = 'none';
            graphParent.style.padding = '0';
            graphParent.style.margin = '0';
            const caption = graphParent.querySelector('.caption');
            if(caption) caption.style.display = 'none';
            document.getElementById('boj-rating-container').appendChild(graphParent);
        }
    }

    if (username !== "Unknown") {
        fetch(`https://codeforces.com/api/user.status?handle=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'OK') {
                    const solvedSet = new Set();
                    const attemptedSet = new Set();

                    data.result.forEach(sub => {
                        if (sub.problem && sub.problem.contestId) {
                            const probId = sub.problem.contestId + sub.problem.index;
                            if (sub.verdict === 'OK') solvedSet.add(probId);
                            else attemptedSet.add(probId);
                        }
                    });
                    
                    solvedSet.forEach(p => attemptedSet.delete(p));
                    
                    const sortLogic = (a, b) => {
                        const numA = parseInt(a.match(/\d+/) ? a.match(/\d+/)[0] : 0);
                        const numB = parseInt(b.match(/\d+/) ? b.match(/\d+/)[0] : 0);
                        if (numA === numB) return a.localeCompare(b);
                        return numA - numB;
                    };

                    const solvedArr = Array.from(solvedSet).sort(sortLogic);
                    const attemptedArr = Array.from(attemptedSet).sort(sortLogic);
                    
                    const solvedContainer = document.getElementById('boj-solved-problems-container');
                    if (solvedContainer && solvedArr.length > 0) {
                        solvedContainer.innerHTML = `<div style="font-size:16px; font-weight:bold; margin-bottom:10px;">총 ${solvedArr.length}문제</div>` +
                            '<div class="boj-problem-list">' + solvedArr.map(p => {
                                const cId = p.match(/\d+/)[0];
                                const pIdx = p.replace(/\d+/, '');
                                return `<a href="/problemset/problem/${cId}/${pIdx}" class="boj-problem-link boj-solved">${p}</a>`;
                            }).join('') + '</div>';
                    } else if (solvedContainer) {
                        solvedContainer.innerHTML = '<span style="color:#888; font-size:14px;">맞은 문제가 없습니다.</span>';
                    }

                    const attemptedContainer = document.getElementById('boj-attempted-problems-container');
                    if (attemptedContainer && attemptedArr.length > 0) {
                        attemptedContainer.innerHTML = `<div style="font-size:16px; font-weight:bold; margin-bottom:10px;">총 ${attemptedArr.length}문제</div>` +
                            '<div class="boj-problem-list">' + attemptedArr.map(p => {
                                const cId = p.match(/\d+/)[0];
                                const pIdx = p.replace(/\d+/, '');
                                return `<a href="/problemset/problem/${cId}/${pIdx}" class="boj-problem-link boj-failed">${p}</a>`;
                            }).join('') + '</div>';
                    } else if (attemptedContainer) {
                        attemptedContainer.innerHTML = '<span style="color:#888; font-size:14px;">시도했지만 맞지 못한 문제가 없습니다.</span>';
                    }
                }
            })
            .catch(err => console.error("API Fetch Error:", err));
    }
}