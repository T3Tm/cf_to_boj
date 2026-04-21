# 🏆 Codeforces to Baekjoon (v4.0.0 "Grounded Modular Standard")

본 프로젝트는 코드포스(Codeforces)의 데이터 위에 백준(BOJ)의 사용자 경험과 로직을 입히는 브라우저 확장 프로그램입니다. **v4.0.0 대규모 업데이트**는 코드포스 환경에서 구현 불가능한 허구적 기능을 배제하고, 소프트웨어 설계 원칙(SOLID)에 기반한 견고한 모듈 시스템을 구축하는 데 집중합니다.

---

## 🎯 1. 개발 철학 (Core Principles)

1.  **현실적 변환 (Grounded Mapping):** 코드포스 API가 제공하지 않는 데이터(예: 그룹 랭킹, 실시간 스트릭 등)를 억지로 생성하지 않습니다. 데이터는 CF의 것을 사용하되, **보여주는 방식(Logic & UI)**만 BOJ로 변환합니다.
2.  **단일 책임 원칙 (Single Responsibility):** 하나의 모듈은 하나의 기능(검색, 티어 계산, 페이지 제어 등)만 담당하여, 코드포스의 UI 업데이트 시 해당 모듈만 수정하면 되도록 설계합니다.
3.  **비파괴적 수정 (Non-Destructive):** 기존 코드포스의 데이터 구조를 파괴하지 않고, DOM 조작과 CSS 주입을 통해 상위에 레이어를 덮어씌우는 방식을 유지합니다.

---

## 🏗️ 2. 디자인 패턴 기반 폴더 구조 (Refined Architecture)

```text
.
├── manifest.json           # 확장 프로그램 명세 (V3 권장 사항 준수)
├── content/
│   ├── inject.js           # [Bootstrap] 전역 네임스페이스 및 테마 초기 로드
│   └── main.js             # [Orchestrator] 라우터를 통한 페이지별 전략 실행
├── src/
│   ├── core/
│   │   ├── router/         # [Strategy Pattern] 경로별 페이지 컨트롤러 매핑
│   │   ├── settings/       # [Observer Pattern] 사용자 설정 관리 및 구독
│   │   ├── storage/        # [Proxy Pattern] API 데이터 및 LocalStorage 통합 관리
│   │   └── engine/         # [Pure Logic] TierCalculator, QueryParser (데이터 가공)
│   ├── components/         # [Atomic Design] 재사용 가능한 UI 조각
│   │   ├── layout/         # Header, Footer 등 전역 레이아웃
│   │   └── feature/        # SearchBar, SpoilerToggle 등 기능성 UI
│   ├── pages/              # [Controllers] 각 페이지(Problem, Status 등) 전용 로직
│   └── utils/              # [Helpers] DOM 조작, 정규식, 필터링 유틸리티
└── styles/                 # [Theme System] CSS Variables 기반 스타일 분리
```

---

## 🎨 3. CSS 아키텍처 및 디자인 시스템 (Style System)

v4.0.0부터는 코드 유지보수성과 스타일 충돌 방지를 위해 엄격한 CSS 설계 표준을 따릅니다.

### ① 전역 변수 관리 (`base/variables.css`)
*   백준의 시그니처 블루(`--boj-primary: #0076c0`)를 포함한 모든 색상과 수치를 변수화합니다.
*   다크모드 대응 시 개별 CSS를 수정하지 않고 변수값만 변경하여 일관성을 유지합니다.

### ② 네임스페이스 및 명시도 전략
*   **네임스페이스:** 모든 커스텀 UI 요소는 `boj-` 접두사를 클래스명에 포함하여 코드포스 기존 스타일과의 충돌을 원천 차단합니다.
*   **!important 배제:** 스타일 덮어쓰기 시 `!important`를 남발하지 않고, `#pageContent`와 같은 상위 컨테이너를 포함한 정밀 셀렉터를 사용하여 명시도를 높입니다.

### ③ 모듈형 스타일 구조
*   `styles/base/`: 디자인 토큰 및 변수 (Variables)
*   `styles/components/`: 독립 UI 컴포넌트 스타일 (Atomic Design)
*   `styles/themes/`: 코드포스 레이아웃 정밀 제압 및 다크모드 (Overrides)

---

## ✅ 4. 구현 확정 기능 vs 보류 사항

### 🟢 구현 확정 (Feasible & Stable)
*   **solved.ac 스타일 티어 이식:** 800~3000+ Rating을 Bronze~Master 티어로 선형 매핑.
*   **통합 검색 엔진:** CF 문제 목록 데이터를 가공하여 `#tags`, `*tier`, `@status` 검색 지원.
*   **백준 스타일 UI:** 1단 레이아웃, 예제 2분할, 알고리즘 분류 스포일러 방지 토글.
*   **클라이언트 페이징:** 채점 현황(Status)의 방대한 데이터를 20개 단위로 슬라이싱하여 노출.

### 🔴 보류/제외 (Infeasible or Error-Prone)
*   **실시간 스트릭 달력:** CF API의 Rate Limit 및 과거 제출 데이터의 파편화로 인해 정확한 구현이 어려움 (추후 단계적 도입 검토).
*   **가상 경험치 시스템:** 서버 연동 없는 클라이언트 전용 데이터는 신뢰성이 낮아 제외.
*   **강제 레이아웃 변경:** CF 고유의 입력 폼(Submit Page) 등 기능적 오류를 유발할 수 있는 부분은 최소한의 CSS만 적용.

---

## 📊 4. 통합 티어 환산 시스템 (Standardized Tiers)

코드포스의 데이터를 백준 스타일로 변환하기 위해 **문제 난이도**와 **유저 등급**을 서로 다른 로직으로 표준화합니다.

### ① 문제 티어 (Problem Difficulty)
코드포스의 Rating(800 ~ 3500+)을 백준의 30단계 체계(B5 ~ R1)에 100점 단위로 선형 매핑합니다.

| 티어 (Tier) | CF Rating 범위 | 비고 |
| :--- | :--- | :--- |
| **Bronze** | 800 ~ 1299 | 100점당 1단계 상승 (800=B5, 1200=B1) |
| **Silver** | 1300 ~ 1799 | 1300=S5, 1700=S1 |
| **Gold** | 1800 ~ 2299 | 1800=G5, 2200=G1 |
| **Platinum** | 2300 ~ 2799 | 2300=P5, 2700=P1 |
| **Diamond** | 2800 ~ 3299 | 2800=D5, 3200=D1 |
| **Ruby** | 3300 ~ 3500+ | 3300=R5, 3700+=R1 |

### ② 유저 티어 (User Rank)
코드포스의 공식 등급(Title) 구간을 백준의 티어 색상과 대응시키며, 구간 내 레이팅에 따라 5~1단계를 부여합니다.

| 티어 (Tier) | CF Rating 범위 | 대응되는 공식 등급 (Title) |
| :--- | :--- | :--- |
| **Bronze** | 0 ~ 1199 | Newbie |
| **Silver** | 1200 ~ 1399 | Pupil |
| **Gold** | 1400 ~ 1599 | Specialist |
| **Platinum** | 1600 ~ 1899 | Expert |
| **Diamond** | 1900 ~ 2399 | Candidate Master, Master, International Master |
| **Ruby** | 2400 ~ 2999 | Grandmaster, International Grandmaster |
| **Master** | 3000+ | Legendary Grandmaster |

---

## 🚀 5. 단계별 리팩토링 로드맵

### Phase 1: 엔진 및 라우터 정립 (v4.0.0)
*   [ ] `main.js` 로직을 `Router`와 `Pages/` 컨트롤러로 분리 (Strategy 패턴 적용).
*   [ ] `TierCalculator` 로직을 `GEMINI.md`의 최신 표준으로 동기화.
*   [ ] `Settings` 모듈 구현으로 사용자 옵션(티어 On/Off 등) 기초 마련.

### Phase 2: UI 컴포넌트 표준화 (v4.1.0)
*   [ ] 헤더(Header) 및 검색창(SearchBar)을 독립 컴포넌트로 분리.
*   [ ] `styles/` 구조를 `Base/Components/Themes`로 파편화하여 테마 전환 속도 개선.

### Phase 3: 로직 안정화 (v4.2.0)
*   [ ] `DOMObserver` 싱글톤 패턴 적용으로 AJAX 렌더링 시 티어 아이콘 유실 방지.
*   [ ] `Fetcher` 모듈에 지수 백오프(Exponential Backoff)를 적용하여 API 차단 방지.
