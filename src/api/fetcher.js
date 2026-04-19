/**
 * src/api/fetcher.js
 * API 통신 및 15분 로컬 캐싱 레이어
 */
window.BOJ_CF.Fetcher = (function() {
    const CACHE_DURATION = 15 * 60 * 1000; // 15분
    const DAILY_CACHE = 24 * 60 * 60 * 1000; // 24시간

    const getCached = (key, duration) => {
        const cached = localStorage.getItem(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < duration) return parsed.data;
        }
        return null;
    };

    return {
        fetchUserStatus: async (username) => {
            const key = `boj_cf_status_${username}`;
            let data = getCached(key, CACHE_DURATION);
            if (data) return data;
            
            try {
                const res = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
                data = await res.json();
                if (data.status === 'OK') localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
                return data;
            } catch (e) { return null; }
        },
        fetchAllProblems: async () => {
            const key = `boj_cf_all_problems`;
            let data = getCached(key, DAILY_CACHE);
            if (data) return data;

            try {
                const res = await fetch(`https://codeforces.com/api/problemset.problems`);
                data = await res.json();
                if (data.status === 'OK') localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data: data.result }));
                return data.result;
            } catch (e) { return null; }
        }
    };
})();