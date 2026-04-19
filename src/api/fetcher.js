/**
 * src/api/fetcher.js
 * API 통신 및 15분 로컬 캐싱 레이어
 */
window.BOJ_CF.Fetcher = (function() {
    const CACHE_DURATION_MS = 15 * 60 * 1000;

    return {
        fetchUserStatus: async (username, forceUpdate = false) => {
            const cacheKey = `boj_cf_status_${username}`;
            const now = Date.now();
            
            if (!forceUpdate) {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (now - parsed.timestamp < CACHE_DURATION_MS) return parsed.data; 
                }
            }
            
            try {
                const res = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                
                const data = await res.json();
                if (data.status === 'OK') {
                    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: data }));
                    return data;
                }
                return null;
            } catch (e) {
                console.error("[BOJ_CF] API Fetch Error:", e);
                return null;
            }
        }
    };
})();