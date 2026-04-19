# 🏆 Codeforces to Baekjoon (v3.3 Advanced Search & Theme Master)

본 프로젝트는 코드포스(Codeforces)의 사용자 경험을 백준(Baekjoon Online Judge/solved.ac) 스타일로 완전히 재구성하는 크롬 확장 프로그램입니다. v3.3 업데이트는 solved.ac의 강력한 복합 검색 문법을 완벽히 지원하는 **AST 파서 엔진** 탑재와, 백준 특유의 깔끔한 **카드형 UI 레이아웃**을 복원하는 데 집중했습니다.

---

## 📂 1. 최종 확정 파일 구조 (Directory Tree)

    .
    ├── manifest.json            # 모듈 로딩 순서 강제 및 권한 설정
    ├── theme-init.js            # 테마 초기화 (화면 깜빡임 차단용 최우선 실행)
    ├── main.js                  # 최종 실행 진입점 및 페이지 라우터
    ├── README.md                # 프로젝트 통합 명세서 (본 문서)
    ├── icons/                   # 아이콘 에셋 (Snake Case 정규화 완료)
    ├── src/                     
    │   ├── api/                 
    │   │   └── fetcher.js       # 15분 로컬 캐싱이 적용된 API 통신 레이어
    │   ├── components/          
    │   │   ├── pillContainer.js # 이벤트 위임 방식의 알약 렌더링 UI
    │   │   ├── searchBar.js     # [업데이트] 띄어쓰기 기준 알약 분리(Tokenization) 생성 로직 탑재
    │   │   ├── spoilerToggle.js # 개별 문제 스포일러 차단 UI
    │   │   └── themeToggle.js   # 글로벌 테마 스위치
    │   ├── core/                
    │   │   ├── queryParser.js   # [전면개편] solved.ac 정규식 문법 완벽 지원 AST 평가 엔진
    │   │   ├── stateManager.js  # Pub/Sub 기반 전역 상태 통제소
    │   │   └── tierCalculator.js# 레이팅 -> 티어 변환 수학 공식
    │   ├── pages/               
    │   │   ├── problem.js       # 개별 문제 레이아웃 제어
    │   │   ├── problemset.js    # [업데이트] API 데이터 하이드레이션(Hydration) 및 인메모리 인덱싱
    │   │   ├── profile.js       # 유저 프로필 스트릭 및 2단 레이아웃 제어
    │   │   └── status.js        # 채점 현황 테이블 티어 렌더링 전담 컨트롤러
    │   └── utils/               
    │       ├── debounce.js      # 입력 지연 최적화
    │       ├── domObserver.js   # AJAX 증발 방지 싱글톤 옵저버
    │       └── sanitizer.js     # XSS 해킹 방어
    └── styles/                  
        ├── variables.css        # 다크/라이트 색상표
        ├── components.css       # 주입 UI 고유 디자인
        └── overrides.css        # [업데이트] 백준 스타일 카드 컨테이너 래핑 및 폰트 강제화

---

## 🚀 2. 핵심 구현 아키텍처 (Core Architecture)

### ① solved.ac 문법 파서 엔진 (AST Query Parser)
단순 문자열 비교(`includes`)가 아닌, 입력된 쿼리의 접두사(Prefix)를 분석하여 메타데이터와 대조하는 진정한 파서입니다.
* **Tokenization:** 유저가 `tag:dp tier:s` 입력 후 엔터를 치면, 하나의 알약이 아닌 **2개의 독립된 알약**으로 자동 분리되어 UI의 가독성을 높입니다.
* **지원 쿼리 규칙:**
    * `tag:X` : 숨겨진 태그 데이터와 정확히 매칭.
    * `tier:X` / `*tier` : 티어 정규식 파싱 및 일치 여부 확인.
    * `s#A..B` : 해결한 사람 수(Solved Count)의 숫자 범위를 추출하여 비교 연산.
    * `@me` / `~@me` : API 연동을 통해 내가 맞은 문제인지 여부 필터링.

### ② 데이터 하이드레이션 (Data Hydration Pipeline)
문제 목록(Problemset) 페이지는 더 이상 화면의 글자만 읽지 않습니다.
1. 페이지 로드 즉시 `api/fetcher.js`가 백그라운드에서 유저의 풀이 기록을 가져옵니다.
2. 테이블을 인메모리 배열로 만들 때, API 결과와 대조하여 각 문제 행 객체에 `isSolved: true/false` 속성을 은밀하게 주입합니다.
3. 이를 통해 화면에 표시되지 않은 정보(`~@me` 쿼리)로도 완벽한 필터링이 가능해집니다.

### ③ 백준 테마 복원 (Baekjoon Card Layout)
* **Card Wrapper:** 코드포스의 넓고 휑한 구조를 버리고, `#pageContent`에 그림자(`box-shadow`)와 둥근 모서리(`border-radius`), 깔끔한 흰색 배경을 부여하여 백준 특유의 종이 질감 레이아웃을 강제합니다.
* **글로벌 폰트:** 레거시 웹 폰트를 제압하고 가독성 높은 산세리프 폰트로 전면 교체하여 현대적인 UI 감각을 복원했습니다.

---

## ⚠️ 3. 아키텍처 방어 로직 (Defenses & Safeties)

1. **라우팅 정밀도 상향:** URL 경로 검사 시 단순 포함이 아닌 정규식을 사용하여, `/problemset/status` 페이지에 검색창이 뜨는 라우팅 붕괴 현상을 100% 차단했습니다.
2. **타겟팅 격리:** 채점 현황(`status.js`)과 문제 목록(`problemset.js`)의 DOM 구조가 다름을 인지하고, 컨트롤러를 분리하여 엉뚱한 제출 번호 열에 아이콘이 박히는 타겟팅 오류를 해결했습니다.
3. **다크모드 스코프 누수 차단:** 코드포스 상단 헤더 메뉴의 강력한 기존 CSS를 제압하기 위해, `overrides.css`의 다크모드 선택자 명시도(Specificity)를 최대로 끌어올려 글자가 안 보이는 현상을 방어했습니다.

---

## 🛠️ 4. 개발 및 유지보수 가이드 (Dev Guide)

1. **새로운 검색 쿼리 추가:** `src/core/queryParser.js` 내부에 새로운 정규표현식 검사 로직을 추가하고 평가기(Evaluator)에 등록하십시오.
2. **테마 수정:** 레이아웃의 형태(여백, 테두리 등)는 `overrides.css`에서 수정하고, 색상 톤은 반드시 `variables.css`의 변수값만 수정하여 일관성을 유지하십시오.
3. **API 한도 주의:** 데이터 하이드레이션이 동작하므로, 개발 중 잦은 새로고침 시 429 에러가 발생하지 않도록 `fetcher.js`의 15분 캐싱 로직을 절대 비활성화하지 마십시오.