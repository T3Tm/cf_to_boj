/**
 * src/api/fetcher.js
 * API 통신 및 15분 로컬 캐싱 레이어
 */
window.BOJ_CF.Fetcher = (function() {
    // getCached 함수 내부 (try-catch 및 삭제 로직 추가)
    const getCached = (key, duration) => {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            const parsed = JSON.parse(cached); // 오염된 JSON 방어
            if (Date.now() - parsed.timestamp < duration) return parsed.data;
            localStorage.removeItem(key); // 만료된 캐시 즉시 제거
        } catch (e) {
            localStorage.removeItem(key); // 에러 발생 시 캐시 삭제로 자가 치유
        }
        return null;
    };

    return {
        fetchUserStatus: async (username) => {
            const key = `boj_cf_status_${username}`;
            const duration = window.BOJ_CF.Config.API_CACHE_DURATION_MINS * 60 * 1000;
            let data = getCached(key, duration);
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
            const duration = window.BOJ_CF.Config.DB_CACHE_DURATION_HOURS * 60 * 60 * 1000;
            let data = getCached(key, duration);
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