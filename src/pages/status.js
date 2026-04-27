/**
 * src/pages/status.js (v4.3.1)
 * [Unified Logic] 전역/문제별 채점 현황 및 조건부 탭 메뉴 활성화
 */
window.BOJ_CF.Pages.Status = (function() {
    let rawData = [];
    let filteredData = [];
    let currentPage = 1;
    const itemsPerPage = 20;
    let pollingInterval = null;
    let isPolling = false;
    
    // 필터 상태
    let filters = {
        problemId: '',
        user: '',
        result: 'all',
        lang: 'all'
    };

    /**
     * 설정에 따른 티어 아이콘 경로를 반환합니다.
     */
    function getTierIconPath(rating, isSolved) {
        const mode = window.BOJ_CF.Settings.get('showProblemTier') || 'always';
        if (mode === 'never') return 'icons/relative-0.svg';
        if (mode === 'solved' && !isSolved) return 'icons/relative-0.svg';
        return window.BOJ_CF.TierCalculator.getProblemTierIcon(rating);
    }

    /**
     * 필터바를 생성하고 이벤트를 바인딩합니다.
     */
    function renderFilterBar(container) {
        const bar = document.createElement('div');
        bar.className = 'boj-filter-bar';
        bar.innerHTML = `
            <div class="filter-item"><label>문제</label><input type="text" id="filter-prob" value="${filters.problemId}" placeholder="예: 123A"></div>
            <div class="filter-item"><label>아이디</label><input type="text" id="filter-user" value="${filters.user}"></div>
            <div class="filter-item">
                <label>결과</label>
                <select id="filter-result">
                    <option value="all" ${filters.result === 'all' ? 'selected' : ''}>모두</option>
                    <option value="OK" ${filters.result === 'OK' ? 'selected' : ''}>맞았습니다!!</option>
                    <option value="WRONG" ${filters.result === 'WRONG' ? 'selected' : ''}>틀렸습니다</option>
                    <option value="TLE" ${filters.result === 'TLE' ? 'selected' : ''}>시간 초과</option>
                    <option value="MLE" ${filters.result === 'MLE' ? 'selected' : ''}>메모리 초과</option>
                </select>
            </div>
            <button id="filter-submit" class="boj-btn-search">검색</button>
        `;
        container.appendChild(bar);

        bar.querySelector('#filter-submit').addEventListener('click', () => {
            filters.problemId = document.getElementById('filter-prob').value.trim();
            filters.user = document.getElementById('filter-user').value.trim();
            filters.result = document.getElementById('filter-result').value;
            applyFilters();
        });
    }

    /**
     * API 데이터를 필터링합니다.
     */
    function applyFilters() {
        filteredData = rawData.filter(sub => {
            if (filters.problemId) {
                const pId = `${sub.problem.contestId}${sub.problem.index}`;
                if (!pId.toLowerCase().includes(filters.problemId.toLowerCase())) return false;
            }
            if (filters.user) {
                const author = sub.author.members[0].handle;
                if (!author.toLowerCase().includes(filters.user.toLowerCase())) return false;
            }
            if (filters.result !== 'all') {
                if (filters.result === 'OK' && sub.verdict !== 'OK') return false;
                if (filters.result === 'WRONG' && sub.verdict !== 'WRONG_ANSWER') return false;
                if (filters.result === 'TLE' && sub.verdict !== 'TIME_LIMIT_EXCEEDED') return false;
                if (filters.result === 'MLE' && sub.verdict !== 'MEMORY_LIMIT_EXCEEDED') return false;
            }
            return true;
        });
        
        // 배경 폴링 업데이트 시에는 페이지를 1로 리셋하지 않음
        if (!isPolling) currentPage = 1;
        renderTable();
    }

    /**
     * 채점 현황 테이블을 렌더링합니다.
     */
    async function renderTable() {
        const tableContainer = document.getElementById('boj-status-table-container');
        if (!tableContainer) return;

        // 기존 타이머 클리어 (중복 실행 방지)
        if (pollingInterval) {
            clearTimeout(pollingInterval);
            pollingInterval = null;
        }

        let hasTesting = false;

        const start = (currentPage - 1) * itemsPerPage;
        const pageItems = filteredData.slice(start, start + itemsPerPage);
        const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

        const currentUser = document.querySelector('.boj-header-user')?.innerText.trim();
        const userStatus = (currentUser && currentUser !== 'Guest') ? await window.BOJ_CF.Fetcher.fetchUserStatus(currentUser) : null;
        const solvedSet = new Set();
        if (userStatus && userStatus.result) {
            userStatus.result.forEach(s => { if (s.verdict === 'OK') solvedSet.add(`${s.problem.contestId}${s.problem.index}`); });
        }

        const tableHtml = `
            <table class="boj-table boj-table-striped">
                <thead>
                    <tr>
                        <th style="width: 10%;">제출 번호</th>
                        <th style="width: 15%;">아이디</th>
                        <th style="width: 15%;">문제</th>
                        <th style="width: 20%;">결과</th>
                        <th style="width: 10%;">메모리</th>
                        <th style="width: 10%;">시간</th>
                        <th style="width: 10%;">언어</th>
                        <th style="width: 10%;">제출 시간</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageItems.map(sub => {
                        const author = sub.author.members[0].handle;
                        const pId = `${sub.problem.contestId}${sub.problem.index}`;
                        const isSolved = solvedSet.has(pId);
                        const iconPath = getTierIconPath(sub.problem.rating, isSolved);
                        const iconUrl = chrome.runtime.getURL(iconPath);
                        
                        // 채점 중인지 확인
                        if (sub.verdict === 'TESTING' || !sub.verdict) hasTesting = true;

                        const verdictClass = sub.verdict === 'OK' ? 'verdict-ac' : ((!sub.verdict || sub.verdict === 'TESTING') ? 'verdict-wait' : (sub.verdict?.includes('LIMIT') ? 'verdict-err' : 'verdict-wa'));
                        const verdictText = translateVerdict(sub);
                        const timeStr = formatRelativeTime(sub.creationTimeSeconds);

                        return `
                            <tr>
                                <td><a href="#" class="boj-sub-link" data-id="${sub.id}" data-contest="${sub.problem.contestId}">${sub.id}</a></td>
                                <td><a href="/profile/${author}">${author}</a></td>
                                <td>
                                    <img src="${iconUrl}" class="boj-tier-icon" style="width:16px; vertical-align:middle; margin-right:4px;">
                                    <a href="/problemset/problem/${sub.problem.contestId}/${sub.problem.index}">${pId}</a>
                                </td>
                                <td class="${verdictClass}">${verdictText}</td>
                                <td>${Math.round(sub.memoryConsumedBytes / 1024)} KB</td>
                                <td>${sub.timeConsumedMillis} ms</td>
                                <td>${sub.programmingLanguage}</td>
                                <td>${timeStr}</td>
                            </tr>
                        `;
                    }).join('')}
                    ${pageItems.length === 0 ? '<tr><td colspan="8" style="text-align:center; padding:40px;">데이터가 없습니다.</td></tr>' : ''}
                </tbody>
            </table>
        `;
        tableContainer.innerHTML = tableHtml;
        renderPager(totalPages);

        tableContainer.querySelectorAll('.boj-sub-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showCodeView(link.getAttribute('data-id'), link.getAttribute('data-contest'));
            });
        });

        // 채점 중인 항목이 현재 페이지에 있다면 1초 후 폴링 (CF API 한도 내 최속)
        if (hasTesting && !isPolling) {
            pollingInterval = setTimeout(pollStatus, 1000);
        }
    }

    /**
     * 최신 데이터를 비동기로 가져와 기존 데이터의 상태만 업데이트합니다.
     */
    async function pollStatus() {
        if (isPolling) return;
        isPolling = true;

        const pathParts = window.location.pathname.split('/');
        const isProblemSpecific = pathParts.includes('problemset') && pathParts.includes('status') && pathParts.includes('problem');
        let contestId = null;
        let problemIndex = null;
        
        if (isProblemSpecific) {
            contestId = pathParts[3];
            problemIndex = pathParts[5];
        } else if (pathParts.includes('contest')) {
            contestId = pathParts[2];
        }

        try {
            let latestData = [];
            if (contestId) {
                if (isProblemSpecific) {
                    latestData = await window.BOJ_CF.Fetcher.fetchStatusWithFilter(contestId, problemIndex, 200, true);
                } else {
                    latestData = await window.BOJ_CF.Fetcher.fetchContestStatus(contestId, 1, 200, true);
                }
            } else {
                latestData = await window.BOJ_CF.Fetcher.fetchRecentStatus(200, true);
            }

            // [핵심 수정] 기존 rawData의 틀을 유지하며 상태만 업데이트
            latestData.forEach(updatedSub => {
                const existingSub = rawData.find(s => s.id === updatedSub.id);
                if (existingSub) {
                    existingSub.verdict = updatedSub.verdict;
                    existingSub.passedTestCount = updatedSub.passedTestCount;
                    existingSub.timeConsumedMillis = updatedSub.timeConsumedMillis;
                    existingSub.memoryConsumedBytes = updatedSub.memoryConsumedBytes;
                }
            });

        } catch(e) {
            console.warn("[BOJ_CF] Polling failed:", e);
        } finally {
            isPolling = false;
            // 필터링된 데이터(filteredData)는 rawData의 참조를 가지고 있으므로 
            // 굳이 applyFilters를 다시 할 필요 없이 테이블만 다시 그립니다.
            renderTable();
        }
    }

    function translateVerdict(sub) {
        const v = sub.verdict;
        if (v === 'OK') return '맞았습니다!!';
        if (v === 'WRONG_ANSWER') return '틀렸습니다';
        if (v === 'TIME_LIMIT_EXCEEDED') return '시간 초과';
        if (v === 'MEMORY_LIMIT_EXCEEDED') return '메모리 초과';
        if (v === 'RUNTIME_ERROR') return '런타임 에러';
        if (v === 'COMPILATION_ERROR') return '컴파일 에러';
        if (v === 'TESTING' || !v) {
            const passed = sub.passedTestCount || 0;
            return passed > 0 ? `채점 중 (${passed}번 테스트)` : '채점 중';
        }
        return v || '대기 중';
    }

    function formatRelativeTime(seconds) {
        const diff = Math.floor(Date.now() / 1000) - seconds;
        if (diff < 60) return `${diff}초 전`;
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    }

    function renderPager(totalPages) {
        let pager = document.getElementById('boj-status-pager');
        if (!pager) {
            pager = document.createElement('div');
            pager.id = 'boj-status-pager';
            pager.className = 'boj-pager';
            document.getElementById('boj-status-table-container').insertAdjacentElement('afterend', pager);
        }
        pager.innerHTML = `
            <button class="boj-btn-pager" ${currentPage === 1 ? 'disabled' : ''} id="boj-prev">이전</button>
            <span style="align-self:center; font-weight:bold;">${currentPage} / ${totalPages}</span>
            <button class="boj-btn-pager" ${currentPage >= totalPages ? 'disabled' : ''} id="boj-next">다음</button>
        `;
        document.getElementById('boj-prev')?.addEventListener('click', () => { currentPage--; renderTable(); window.scrollTo(0,0); });
        document.getElementById('boj-next')?.addEventListener('click', () => { currentPage++; renderTable(); window.scrollTo(0,0); });
    }

    async function showCodeView(submissionId, contestId) {
        const pc = document.querySelector('#pageContent');
        pc.innerHTML = '<div style="text-align:center; padding:50px;">코드를 불러오는 중...</div>';
        
        // 1. 소스코드 URL 후보 (콘테스트 경로 및 문제셋 경로)
        const urls = [
            `https://codeforces.com/contest/${contestId}/submission/${submissionId}`,
            `https://codeforces.com/problemset/submission/${contestId}/${submissionId}`
        ];

        let html = '';
        let successUrl = '';

        for (const url of urls) {
            try {
                const resp = await fetch(url);
                if (resp.ok) {
                    html = await resp.text();
                    if (html.includes('id="program-source-text"')) {
                        successUrl = url;
                        break;
                    }
                }
            } catch (e) {
                console.warn(`[BOJ_CF] Failed to fetch from ${url}:`, e);
            }
        }

        if (!html) {
            pc.innerHTML = `<div style="text-align:center; padding:50px; color:var(--brand-danger);">코드를 불러올 수 없습니다. (권한 부족 또는 비공개 코드)</div>
                            <div style="text-align:center;"><button class="boj-btn" onclick="location.reload()">돌아가기</button></div>`;
            return;
        }

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const codeEl = doc.querySelector('#program-source-text');
            const code = codeEl ? codeEl.innerText : "// 코드를 찾을 수 없습니다.";
            const infoTable = doc.querySelector('.datatable');

            // 2. Ace Editor 설정 동기화
            if (typeof ace !== 'undefined') {
                const acePath = chrome.runtime.getURL('libs_ace/');
                ace.config.set('packaged', true);
                ace.config.set('basePath', acePath);
                ace.config.set('modePath', acePath);
                ace.config.set('themePath', acePath);
                ace.config.set('workerPath', acePath);
            }

            pc.innerHTML = `
                <div class="boj-header-section"><h1 style="text-align:left; font-size:28px; color:var(--text-main);">소스 코드</h1></div>
                <div id="boj-code-info-container" style="margin-bottom:20px;"></div>
                <div id="boj-code-editor" style="height:600px; border:1px solid var(--border-standard); border-radius:var(--radius-main);"></div>
                <div style="margin-top:20px; text-align:right;"><button class="boj-btn" onclick="location.reload()">목록으로 돌아가기</button></div>
            `;

            if (infoTable) {
                infoTable.classList.add('boj-table');
                document.getElementById('boj-code-info-container').appendChild(infoTable);
            }

            const editor = ace.edit("boj-code-editor");
            const settings = window.BOJ_CF.Settings.getAll();
            editor.setTheme(`ace/theme/${settings.editorTheme || 'monokai'}`);
            editor.setFontSize(settings.editorFontSize || 14);
            editor.setValue(code, -1);
            editor.setReadOnly(true);

            // 언어 감지 및 모드 설정
            const langText = infoTable?.querySelector('td:nth-child(4)')?.innerText.toLowerCase() || '';
            let mode = 'text';
            if (langText.includes('cpp') || langText.includes('g++')) mode = 'c_cpp';
            else if (langText.includes('java')) mode = 'java';
            else if (langText.includes('python')) mode = 'python';
            else if (langText.includes('javascript') || langText.includes('js')) mode = 'javascript';
            else if (langText.includes('rust')) mode = 'rust';
            
            editor.session.setMode(`ace/mode/${mode}`);

        } catch (e) {
            console.error("[BOJ_CF] Code View Rendering Error:", e);
            pc.innerHTML = `<div style="text-align:center; padding:50px;">에러 발생: ${e.message}</div>`;
        }
    }

    return {
        init: async function() {
            const pc = document.querySelector('#pageContent');
            if (!pc) return;

            const path = window.location.pathname;
            const pathParts = path.split('/');
            let contestId = null;
            let problemIndex = null;

            // 경로 분석: /problemset/status/{contestId}/problem/{index} 형태인지 확인
            const isProblemSpecific = pathParts.includes('problemset') && pathParts.includes('status') && pathParts.includes('problem');

            if (isProblemSpecific) {
                contestId = pathParts[3];
                problemIndex = pathParts[5];
                filters.problemId = `${contestId}${problemIndex}`;
            } else if (pathParts.includes('contest')) {
                contestId = pathParts[2];
            }

            // 문제별 채점 현황일 경우에만 탭 메뉴 생성
            let tabMenuHtml = '';
            if (isProblemSpecific && contestId && problemIndex) {
                tabMenuHtml = `
                    <ul class="boj-tabs problem-menu">
                        <li><a href="/problemset/problem/${contestId}/${problemIndex}">문제</a></li>
                        <li><a href="/problemset/submit?contestId=${contestId}&problemIndex=${problemIndex}">제출</a></li>
                        <li class="active"><a href="#">채점 현황</a></li>
                    </ul>
                `;
            }

            pc.innerHTML = `
                ${tabMenuHtml}
                <div class="boj-header-section"><h1 style="text-align:left; font-size:28px; color:var(--text-main);">채점 현황</h1></div>
                <div id="boj-filter-container"></div>
                <div id="boj-status-table-container"><div style="text-align:center; padding:50px;">데이터를 불러오는 중...</div></div>
            `;
            renderFilterBar(document.getElementById('boj-filter-container'));

            // 데이터 로드 로직
            if (contestId) {
                if (isProblemSpecific) {
                    rawData = await window.BOJ_CF.Fetcher.fetchStatusWithFilter(contestId, problemIndex, 200);
                } else {
                    rawData = await window.BOJ_CF.Fetcher.fetchContestStatus(contestId, 1, 200);
                }
            } else {
                rawData = await window.BOJ_CF.Fetcher.fetchRecentStatus(200);
            }

            applyFilters();
        }
    };
})();