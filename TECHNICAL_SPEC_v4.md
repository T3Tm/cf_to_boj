# 🛠️ Codeforces to Baekjoon (CF-to-BOJ) Technical Specification v4.0

이 문서는 현재 프로젝트의 기능 명세와 로직 설계를 정리한 것입니다. CSS 버그 해결 및 향후 유지보수를 위해 로직과 UI 조작을 분리하는 구조를 지향합니다.

## 1. 현재 지원 기능 (Current Features)

### 1.1. 전역 (Global)
- **헤더 리마스터**: 상단 바를 백준 스타일로 교체 (`Header.js`)
- **설정 시스템**: `chrome.storage.local`을 이용한 테마 및 렌더링 옵션 저장 (`Settings`)
- **티어 엔진**: CF Rating을 BOJ 티어로 환산 (문제/유저 구분) (`TierCalculator.js`)

### 1.2. 페이지별 기능 (Page Specific)
- **문제 상세 (`problem.js`)**
  - BOJ 1단 레이아웃 재현 (문제/제출/채점 현황 탭)
  - 정보 테이블 (시간/메모리 제한, 정답 수)
  - 예제 2분할 레이아웃 및 복사 버튼
  - 알고리즘 분류 스포일러 처리
- **문제 목록 (`problemset.js`)**
  - 가상 테이블(Virtual Table)을 통한 렌더링 성능 최적화
  - 복합 쿼리 파싱 검색 (`r:s3`, `@me`, `#dp` 등)
  - 티어 아이콘 주입 및 정렬 기능
- **제출 (`submit.js`)**
  - BOJ 스타일의 깔끔한 제출 폼 레이아웃
  - 코드포스 원본 폼 데이터와의 연동 및 자동 리다이렉트 방지
- **채점 현황 (`status.js`)**
  - 한글 결과 번역 (맞았습니다!!, 틀렸습니다 등)
  - 티어 아이콘 주입 및 테이블 시각화 개선
  - 20개 단위의 자체 페이징 처리
- **유저 프로필 (`profile.js`)**
  - 유저 티어 아이콘 노출
  - 맞은 문제/시도한 문제 리스트 시각화
  - 채점 결과 통계 패널 (AC, WA, TLE 등)

---

## 2. 로직 설계 (Proposed Logic Design)

CSS 버그를 줄이고 로직의 안정성을 높이기 위해 다음과 같은 구조로 고도화합니다.

### 2.1. 레이어 아키텍처 (Layered Architecture)
1.  **Data Layer (`Fetcher`, `Storage`)**
    - API 호출 및 로컬 캐싱 담당.
    - 데이터 일관성을 보장하며, 페이지 로직은 원본 API 응답 대신 가공된 DTO(Data Transfer Object)를 사용함.
2.  **Logic Layer (`Router`, `StateManager`, `TierCalculator`)**
    - 페이지 전환 및 전역 상태(검색 필터, 테마 등) 관리.
    - `QueryParser`를 통한 검색 로직의 중앙 집중화.
3.  **UI/Component Layer (`Pages`, `Components`)**
    - DOM 조작을 최소화하고 시맨틱한 클래스(`boj-*`) 부여에 집중.
    - **중요**: 인라인 스타일을 지양하고 CSS에서 제어하도록 설계.

### 2.2. 페이지 생명주기 (Page Lifecycle)
Codeforces는 AJAX를 통한 부분 로딩이 잦으므로, `DOMObserver`와 연동된 명확한 생명주기가 필요합니다.
-   `init()`: 페이지 진입 시 1회 실행. 데이터 페칭 및 기본 컨테이너 구축.
-   `render()`: 데이터 로드 완료 또는 상태 변경 시 UI 갱신.
-   `cleanup()`: 페이지 이탈 또는 재랜더링 전 기존 요소/이벤트 제거 (버그 방지).

### 2.3. DOM 조작 및 CSS 연동 전략
-   **Class-First**: JS에서 `.style`을 직접 수정하기보다 `.classList.add('boj-is-solved')`와 같이 상태를 클래스로 표현.
-   **Placeholder Strategy**: 원본 요소를 숨기기 전(`display: none`), 필요한 데이터를 먼저 추출하고 `BOJ-Container`를 주입하여 레이아웃 흔들림(Layout Shift) 방지.
-   **Surgical Injection**: `DOMObserver`를 사용할 때는 `boj-processed` 클래스를 활용하여 무한 루프를 원천 차단.

---

## 3. 핵심 로직 고도화 계획 (Roadmap)

1.  **CSS 변수화**: 모든 색상과 간격을 `variables.css`의 시맨틱 변수로 교체하여 테마 변경 대응력 강화.
2.  **Fetcher 안정화**: `Rate Limit` 대응 및 비로그인 유저(`Guest`)에 대한 예외 처리 강화.
3.  **Router 정규식 정밀화**: `GEMINI.md`의 지침에 따라 경로 충돌 방지 (예: `/problemset/status` vs `/problemset`).
4.  **검색 성능 최적화**: 대량의 문제 리스트(9000+) 필터링 시 `Worker` 또는 `Debounce` 적용 확대.
