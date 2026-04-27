# 🧩 Codeforces to Baekjoon (CF-to-BOJ) Logic Architecture

이 문서는 UI와 분리된 확장 프로그램의 핵심 비즈니스 로직과 데이터 흐름을 정의합니다.

## 1. 데이터 모델 (Data Model)

### 1.1. 전역 상태 (Global State)
`StateManager`에서 관리하며, 모든 페이지에서 접근 가능한 상태입니다.
-   **UserContext**: 현재 로그인된 사용자의 Handle, Rating, Tier.
-   **ProblemDB**: 코드포스 전체 문제 목록 및 통계 (초기 1회 로드 및 캐싱).
-   **Settings**: 사용자가 설정한 옵션 (테마, 페이지 당 노출 수, 검색 옵션 등).
-   **UIState**: 현재 활성화된 필터, 정렬 기준 등.

### 1.2. 캐싱 전략 (Caching Strategy)
-   **Problem List (Static-ish)**: 24시간 주기로 `chrome.storage.local`에 저장. 데이터 용량이 크므로 `localStorage` 대신 브라우저 로컬 스토리지를 권장.
-   **User Status (Dynamic)**: 5~15분 주기로 캐싱. 로그인된 유저가 바뀔 경우 즉시 무효화(Invalidate).
-   **Session Data**: 현재 페이지의 검색 결과 등은 메모리 내 `StateManager`에서 관리.

---

## 2. 핵심 모듈별 설계 (Core Modules)

### 2.1. `Router` (Navigation Engine)
-   **정밀 매핑**: 단순 `includes`가 아닌 정규표현식을 사용해 중복 실행 방지.
-   **Life-cycle Hook**: 페이지 전환 시 `onMount`와 `onUnmount`를 호출하여 이벤트 리스너와 `DOMObserver`를 정리.

### 2.2. `Fetcher` (Data Service)
-   **Queueing**: 짧은 시간 내에 동일한 API 호출이 발생할 경우 큐에 담아 1회만 실행 (Request Deduplication).
-   **Retry logic**: 지수 백오프(Exponential Backoff)를 통한 네트워크 불안정성 대응.
-   **DTO Transformation**: API 원본 데이터를 그대로 넘기지 않고, 앱에서 사용하기 편한 형태(예: `id: "123A"`, `isSolved: true`)로 가공하여 반환.

### 2.3. `QueryParser` (Search Engine)
-   **Tokenizing**: 공백 및 파이프(`|`) 기호를 기준으로 쿼리를 토큰화.
-   **Evaluation**: 각 토큰에 대해 `Predicate` 함수를 생성하고, 이를 `Array.filter`와 연계하여 고속 필터링 수행.
-   **Tier Reverse-mapping**: 백준 티어 코드(s3 등)를 레이팅 범위로 변환하여 필터링 조건에 주입.

---

## 3. 페이지 생명주기 로직 (Page Lifecycle)

모든 페이지 컨트롤러(`Pages.*`)는 아래의 표준 생명주기를 따릅니다.

1.  **`loadData()`**: 필요한 API 및 캐시 데이터를 비동기로 로드.
2.  **`prepareDOM()`**: 기존 코드포스 요소를 숨기고(CSS 클래스 부여), BOJ 스타일의 컨테이너 주입.
3.  **`bindEvents()`**: 버튼 클릭, 입력 필드 변경 등의 이벤트 핸들러 등록.
4.  **`observe()`**: AJAX로 나중에 로드되는 요소(예: 테이블 행)를 감지하여 티어 아이콘 등을 주입.
5.  **`cleanup()`**: 페이지를 떠날 때 등록된 모든 Observer와 Global Event 리스너 제거.

---

## 4. 데이터 흐름 예시 (Example: Problem Search)

1.  **Input**: 사용자가 검색바에 `r:g1 #dp` 입력.
2.  **Event**: `SearchBar` 컴포넌트가 `StateManager.addFilter()` 호출.
3.  **Logic**: `StateManager`가 상태를 갱신하고 구독자(`Problemset.render`)에게 알림.
4.  **Parsing**: `QueryParser`가 `r:g1`을 `rating >= 1400 && rating < 1500`으로, `#dp`를 `tags.includes('dp')`로 변환.
5.  **Filtering**: `ProblemDB`에서 조건에 맞는 문제들을 필터링.
6.  **Rendering**: 가공된 문제 리스트를 `VirtualTable`에 전달하여 DOM 갱신.

---

## 5. 보안 및 성능 고려사항
-   **Sanitization**: 모든 사용자 입력값(검색어 등)은 `DOMPurify` 등을 통해 XSS 방지 처리.
-   **Memory Management**: `DOMObserver`가 무한 루프에 빠지지 않도록 `target`과 `subtree` 범위를 최소화하고, `boj-processed` 플래그를 엄격히 사용.
-   **Concurrency**: 다수의 API 요청이 비동기로 발생할 때 `Promise.all`을 사용하여 병렬 처리하되, Rate Limit을 넘지 않도록 `Fetcher` 레벨에서 제어.
