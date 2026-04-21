/**
 * src/utils/domObserver.js (v4.0.0)
 * [Logic Stabilization] 안정적인 DOM 변화 감지 엔진 (싱글톤 & 무한루프 방어)
 * 
 * 1. Debounce (250ms): 잦은 DOM 변경 시 연산 부하 방지
 * 2. Infinite Loop Shield: BOJ 주입 요소 감지 시 알림 건너뛰기
 * 3. Lifecycle Management: observe/disconnect를 통한 메모리 관리
 */
window.BOJ_CF.Utils.DOMObserver = (function() {
    let observer = null;
    let debounceTimer = null;
    const callbacks = new Set(); // 페이지별 복구 로직 콜백

    /**
     * 등록된 모든 콜백을 안전하게 실행합니다.
     */
    function notify() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log("[BOJ_CF] DOM Change detected. Running recovery callbacks...");
            callbacks.forEach(callback => {
                try {
                    callback();
                } catch (e) {
                    console.error("[BOJ_CF] Observer callback execution error:", e);
                }
            });
        }, 250);
    }

    return {
        /**
         * 특정 타겟(기본 #pageContent)을 감시하고 변경 시 콜백을 호출합니다.
         */
        observe: function(targetSelector, callback) {
            if (callback) callbacks.add(callback);

            // 기존 옵저버가 있다면 정리 후 재연결 (중복 방지)
            if (observer) observer.disconnect();

            const target = document.querySelector(targetSelector || '#pageContent');
            if (!target) {
                console.warn(`[BOJ_CF] Observer target not found: ${targetSelector}`);
                return;
            }

            observer = new MutationObserver((mutations) => {
                let hasRelevantChange = false;

                for (const mutation of mutations) {
                    // 노드 추가/삭제 감지
                    if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                        // 무한 루프 방어: 추가된 노드가 BOJ 관련 요소이면 무시
                        const isInternalChange = Array.from(mutation.addedNodes).some(node => 
                            (node.nodeType === 1) && (
                                node.id?.startsWith('boj-') || 
                                node.classList?.contains('boj-processed') ||
                                node.tagName === 'IMG' && node.classList?.contains('boj-tier-icon')
                            )
                        );

                        if (!isInternalChange) {
                            hasRelevantChange = true;
                            break;
                        }
                    }
                }

                if (hasRelevantChange) notify();
            });

            observer.observe(target, { 
                childList: true, 
                subtree: true,
                characterData: false,
                attributes: false 
            });
            
            console.log(`[BOJ_CF] Observer is now watching: ${targetSelector || '#pageContent'}`);
        },

        /**
         * 감시를 완전히 중단하고 모든 콜백을 제거합니다. (페이지 전환 시 필수)
         */
        disconnect: function() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            callbacks.clear();
            if (debounceTimer) clearTimeout(debounceTimer);
            console.log("[BOJ_CF] Observer disconnected and cleared.");
        }
    };
})();