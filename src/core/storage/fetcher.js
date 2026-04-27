/**
 * src/core/storage/fetcher.js (v4.0.0)
 * [Logic Stabilization] API 통신 및 캐싱 레이어 (지수 백오프 적용)
 * 
 * 1. Exponential Backoff: 429 에러 또는 네트워크 장애 시 재시도 로직
 * 2. Proxy Cache: 로컬 스토리지를 활용한 계층형 캐싱
 * 3. Error Recovery: 오염된 캐시 데이터 자동 감지 및 초기화
 */
window.BOJ_CF.Fetcher = (function() {
    /**
     * 지수 백오프 알고리즘을 적용한 fetch 래퍼
     */
    async function requestWithRetry(url, retries = 3, backoff = 1000) {
        try {
            const response = await fetch(url);
            
            // 429 Too Many Requests 처리
            if (response.status === 429 && retries > 0) {
                console.warn(`[BOJ_CF] 429 Too Many Requests. Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return requestWithRetry(url, retries - 1, backoff * 2);
            }

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const data = await response.json();
            if (data.status !== 'OK') throw new Error(`API Error: ${data.comment || 'Unknown error'}`);
            
            return data;
        } catch (error) {
            if (retries > 0) {
                console.error(`[BOJ_CF] Request failed: ${error.message}. Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return requestWithRetry(url, retries - 1, backoff * 2);
            }
            console.error(`[BOJ_CF] Max retries reached for: ${url}`);
            return null;
        }
    }

    /**
     * 캐시된 데이터를 가져오거나 만료 시 제거합니다.
     */
    function getCached(key, duration) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < duration) {
                return parsed.data;
            }
            localStorage.removeItem(key);
        } catch (e) {
            localStorage.removeItem(key);
        }
        return null;
    }

    /**
     * 데이터를 캐시에 저장합니다.
     */
    function setCached(key, data) {
        try {
            const cacheObj = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(key, JSON.stringify(cacheObj));
        } catch (e) {
            console.error("[BOJ_CF] Cache storage failed:", e);
        }
    }

    return {
        /**
         * 특정 유저의 제출 현황을 가져옵니다. (15분 캐시)
         */
        fetchUserStatus: async function(username) {
            const key = `boj_cf_status_${username}`;
            const duration = (window.BOJ_CF.Config?.API_CACHE_DURATION_MINS || 15) * 60 * 1000;
            
            let data = getCached(key, duration);
            if (data) return data;

            const result = await requestWithRetry(`https://codeforces.com/api/user.status?handle=${username}`);
            if (result) {
                setCached(key, result);
                return result;
            }
            return null;
        },

        /**
         * 코드포스의 모든 문제 데이터를 가져옵니다. (24시간 캐시)
         */
        fetchAllProblems: async function() {
            const key = `boj_cf_all_problems`;
            const duration = (window.BOJ_CF.Config?.DB_CACHE_DURATION_HOURS || 24) * 60 * 60 * 1000;
            
            let data = getCached(key, duration);
            if (data) return data;

            const result = await requestWithRetry(`https://codeforces.com/api/problemset.problems`);
            if (result && result.result) {
                setCached(key, result.result);
                return result.result;
            }
            return null;
        },

        /**
         * 유저의 상세 프로필 정보를 가져옵니다. (15분 캐시)
         */
        fetchUserInfo: async function(handle) {
            const key = `boj_cf_user_info_${handle}`;
            const duration = 15 * 60 * 1000;

            let data = getCached(key, duration);
            if (data) return data;

            const result = await requestWithRetry(`https://codeforces.com/api/user.info?handles=${handle}`);
            if (result && result.result) {
                setCached(key, result.result[0]);
                return result.result[0];
            }
            return null;
        },

        /**
         * 전역 최신 제출 현황을 가져옵니다. (1분 캐시)
         */
        fetchRecentStatus: async function(count = 100, bypassCache = false) {
            const key = `boj_cf_recent_status_${count}`;
            const duration = 1 * 60 * 1000; // 1분

            if (!bypassCache) {
                let data = getCached(key, duration);
                if (data) return data;
            }

            const result = await requestWithRetry(`https://codeforces.com/api/problemset.recentStatus?count=${count}`);
            if (result && result.result) {
                if (!bypassCache) setCached(key, result.result);
                return result.result;
            }
            return null;
        },

        /**
         * 특정 콘테스트의 제출 현황을 가져옵니다. (1분 캐시)
         */
        fetchContestStatus: async function(contestId, from = 1, count = 100, bypassCache = false) {
            const key = `boj_cf_contest_status_${contestId}_${from}_${count}`;
            const duration = 1 * 60 * 1000;

            if (!bypassCache) {
                let data = getCached(key, duration);
                if (data) return data;
            }

            const result = await requestWithRetry(`https://codeforces.com/api/contest.status?contestId=${contestId}&from=${from}&count=${count}`);
            if (result && result.result) {
                if (!bypassCache) setCached(key, result.result);
                return result.result;
            }
            return null;
        },

        /**
         * [고도화] 특정 조건을 만족하는 데이터가 충분히 모일 때까지 재귀적으로 페칭합니다.
         */
        fetchStatusWithFilter: async function(contestId, problemIndex, targetCount = 100, bypassCache = false) {
            const key = `boj_cf_filtered_status_${contestId}_${problemIndex}_${targetCount}`;
            const duration = 1 * 60 * 1000;

            if (!bypassCache) {
                let cachedData = getCached(key, duration);
                if (cachedData) return cachedData;
            }

            let allFilteredResults = [];
            let currentFrom = 1;
            const batchSize = 500; // 한 번에 가져올 양
            const maxAttempts = 4; // 최대 2000개까지 탐색

            for (let i = 0; i < maxAttempts; i++) {
                const result = await requestWithRetry(`https://codeforces.com/api/contest.status?contestId=${contestId}&from=${currentFrom}&count=${batchSize}`);
                if (!result || !result.result || result.result.length === 0) break;

                const filtered = result.result.filter(sub => sub.problem.index === problemIndex);
                allFilteredResults = [...allFilteredResults, ...filtered];

                if (allFilteredResults.length >= targetCount) break;
                currentFrom += batchSize;
            }

            const finalData = allFilteredResults.slice(0, targetCount * 2); // 여유 있게 보관
            if (!bypassCache) setCached(key, finalData);
            return finalData;
        }
    };
})();