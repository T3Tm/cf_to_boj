/**
 * scripts/utils.js
 * 공통 유틸리티 (100점 단위 티어 분배 및 API 캐싱 방어)
 */
const Utils = {
    getUserTierIcon: (rating) => {
        if (!rating) return 'icons/norating.svg';
        const r = parseInt(rating);
        if (isNaN(r) || r === 0) return 'icons/norating.svg';
        
        if (r < 1200) {
            if (r < 1000) return 'icons/bronze5.svg';
            if (r < 1050) return 'icons/bronze4.svg';
            if (r < 1100) return 'icons/bronze3.svg';
            if (r < 1150) return 'icons/bronze2.svg';
            return 'icons/bronze1.svg';
        }
        if (r < 1400) {
            if (r < 1240) return 'icons/silver5.svg';
            if (r < 1280) return 'icons/silver4.svg';
            if (r < 1320) return 'icons/silver3.svg';
            if (r < 1360) return 'icons/silver2.svg';
            return 'icons/silver1.svg';
        }
        if (r < 1600) {
            if (r < 1440) return 'icons/gold5.svg';
            if (r < 1480) return 'icons/gold4.svg';
            if (r < 1520) return 'icons/gold3.svg';
            if (r < 1560) return 'icons/gold2.svg';
            return 'icons/gold1.svg';
        }
        if (r < 1900) {
            if (r < 1660) return 'icons/platinum5.svg';
            if (r < 1720) return 'icons/platinum4.svg';
            if (r < 1780) return 'icons/platinum3.svg';
            if (r < 1840) return 'icons/platinum2.svg';
            return 'icons/platinum1.svg';
        }
        if (r < 2100) {
            if (r < 1940) return 'icons/diamond5.svg';
            if (r < 1980) return 'icons/diamond4.svg';
            if (r < 2020) return 'icons/diamond3.svg';
            if (r < 2060) return 'icons/diamond2.svg';
            return 'icons/diamond1.svg';
        }
        if (r < 2400) {
            if (r < 2160) return 'icons/ruby5.svg';
            if (r < 2220) return 'icons/ruby4.svg';
            if (r < 2280) return 'icons/ruby3.svg';
            if (r < 2340) return 'icons/ruby2.svg';
            return 'icons/ruby1.svg';
        }
        return 'icons/master.svg'; 
    },

    getProblemTierIcon: (rating) => {
        if (!rating || rating === '?') return 'icons/question_mark.svg';
        const r = parseInt(rating);
        if (isNaN(r) || r === 0) return 'icons/question_mark.svg';
        
        if (r < 900) return 'icons/bronze5.svg';
        if (r < 1000) return 'icons/bronze4.svg';
        if (r < 1100) return 'icons/bronze3.svg';
        if (r < 1200) return 'icons/bronze2.svg';
        if (r < 1300) return 'icons/bronze1.svg';

        if (r < 1400) return 'icons/silver5.svg';
        if (r < 1500) return 'icons/silver4.svg';
        if (r < 1600) return 'icons/silver3.svg';
        if (r < 1700) return 'icons/silver2.svg';
        if (r < 1800) return 'icons/silver1.svg';

        if (r < 1900) return 'icons/gold5.svg';
        if (r < 2000) return 'icons/gold4.svg';
        if (r < 2100) return 'icons/gold3.svg';
        if (r < 2200) return 'icons/gold2.svg';
        if (r < 2300) return 'icons/gold1.svg';

        if (r < 2400) return 'icons/platinum5.svg';
        if (r < 2500) return 'icons/platinum4.svg';
        if (r < 2600) return 'icons/platinum3.svg';
        if (r < 2700) return 'icons/platinum2.svg';
        if (r < 2800) return 'icons/platinum1.svg';

        if (r < 2900) return 'icons/diamond5.svg';
        if (r < 3000) return 'icons/diamond4.svg';
        if (r < 3100) return 'icons/diamond3.svg';
        if (r < 3200) return 'icons/diamond2.svg';
        if (r < 3300) return 'icons/diamond1.svg';

        if (r < 3400) return 'icons/ruby5.svg';
        if (r < 3500) return 'icons/ruby4.svg';
        
        return 'icons/ruby3.svg'; 
    },

    getProblemId: () => {
        const parts = window.location.pathname.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        if (parts.includes('problem') || parts.includes('status') || parts.includes('submit')) {
            if (lastPart === 'status' || lastPart === 'submit' || lastPart === 'problem' || !isNaN(lastPart)) return "전체"; 
            return lastPart;
        }
        return "전체";
    },

    getUsername: () => {
        return document.querySelector('.lang-chooser a[href^="/profile/"]')?.innerText.trim() || '';
    },

    getCurrentUser: () => {
        try {
            const profileLink = document.querySelector('div.lang-chooser a[href^="/profile/"]');
            if (profileLink) {
                const username = profileLink.innerText.trim();
                const colorClass = Array.from(profileLink.classList).find(c => c.startsWith('user-')) || 'user-black';
                let fakeRating = 1000;
                if(colorClass === 'user-green') fakeRating = 1300;
                else if(colorClass === 'user-cyan') fakeRating = 1500;
                else if(colorClass === 'user-blue') fakeRating = 1700;
                else if(colorClass === 'user-violet') fakeRating = 2000;
                else if(colorClass === 'user-orange') fakeRating = 2300;
                else if(colorClass === 'user-red' || colorClass === 'user-legendary') fakeRating = 2500;
                return { username, rating: fakeRating, colorClass };
            }
            return null;
        } catch (e) {
            return null;
        }
    },

    // [신규] API 초당 호출 제한 방어용 캐싱 함수 (15분 유효)
    fetchUserStatusWithCache: async (username) => {
        const cacheKey = `boj_cf_status_${username}`;
        const cached = localStorage.getItem(cacheKey);
        const now = Date.now();
        
        if (cached) {
            const parsed = JSON.parse(cached);
            if (now - parsed.timestamp < 15 * 60 * 1000) return parsed.data; // 15분 이내면 캐시 반환
        }
        
        try {
            const res = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
            const data = await res.json();
            if (data.status === 'OK') {
                localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: data }));
                return data;
            }
            return null;
        } catch (e) {
            console.error("API Fetch Error:", e);
            return null;
        }
    }
};