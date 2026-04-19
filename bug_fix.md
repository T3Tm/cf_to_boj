# 🏆 Codeforces to Baekjoon (v3.11 Rendering & Query Parser Master)

본 명세서는 낡은 서브 메뉴(Second-level Menu)의 완벽한 철거, 가상 테이블(Virtual Table)의 페이지네이션(Pagination) 도입, 그리고 띄어쓰기가 포함된 태그(`brute force` 등)의 검색 오류를 해결하기 위한 아키텍처 개선 지침서입니다.

---

## 🚨 1. 치명적 버그 원인 분석 및 3회 교차 검증 (Verification)

### ① 1차 검증: 서브 메뉴(`.second-level-menu`) 잔재 처리
* **원인:** v3.10에서 최상단 `#header`는 전면 재건축했으나, 그 아래에 위치한 서브 메뉴 탭(Problems, Submit, Status 등)은 건드리지 않아 구형 LavaLamp 애니메이션과 낡은 탭 디자인이 그대로 노출되었습니다.
* **해결 설계:** `overrides.css`에서 해당 클래스를 영구적으로 숨김(`display: none`) 처리하여 시각적 공해를 제거합니다. 단, 서브 메뉴를 지우면 '제출(Submit)' 페이지로 가는 링크가 사라지는 치명적 문제가 발생합니다. 따라서 서브 메뉴를 철거하는 대신, **'제출' 링크를 우리가 v3.10에서 만든 깔끔한 메인 헤더(GNB)의 중앙 메뉴 리스트에 추가**하여 기능 손실을 막아야 합니다.

### ② 2차 검증: 가상 테이블의 페이지네이션 부재
* **원인:** 기존 `problemset.js`는 브라우저 과부하를 막기 위해 검색 결과를 `slice(0, 100)`으로 잘라서 1페이지만 보여주었습니다. 결과가 500개라면 나머지 400개를 볼 방법이 없었습니다.
* **해결 설계:** 상태 관리자(StateManager)가 아닌 `problemset.js` 내부에 **로컬 상태 변수(`currentPage`)**를 도입합니다. 검색 결과를 배열로 만든 뒤, `(currentPage - 1) * 100`부터 `currentPage * 100`까지 자르도록 슬라이스 범위를 동적으로 변경합니다. 그리고 가상 테이블 하단에 백준 스타일의 페이지 이동 버튼(`< 1 2 3 4 5 >`)을 렌더링하고, 클릭 이벤트를 달아 `currentPage`를 변경한 뒤 테이블을 다시 그리도록(Re-render) 설계합니다.

### ③ 3차 검증: 띄어쓰기가 포함된 태그(예: brute force) 검색 불가
* **원인:** 검색창(`searchBar.js`)에서 유저가 엔터를 치면, 정규식(`split(/\s+/)`)이 무조건 띄어쓰기를 기준으로 알약을 쪼개버립니다. `tag:brute force`라고 치면 `tag:brute` 알약 하나와 `force` 알약 하나로 분리되어 검색이 망가졌습니다.
* **해결 설계 (Underscore Substitution):** 복잡하게 따옴표(" ") 정규식을 만드는 대신, **'언더바(_) 치환 전략'**을 사용합니다. 유저가 `tag:brute_force`라고 붙여서 쓰도록 유도합니다(검색창 placeholder 문구 수정). 그리고 `queryParser.js`에서 태그를 검사할 때, 검색어에 들어있는 언더바(`_`)를 띄어쓰기(` `)로 치환(Replace)한 뒤에 원본 데이터와 비교하도록 엔진을 살짝 비틀어주면 가장 빠르고 우아하게 해결됩니다.

---

## 🛠️ 2. 아키텍처 개편 및 조치 지침 (Implementation Guide)

개발자님께서는 코드를 직접 수정하실 때 아래의 흐름을 엄격하게 따라 주십시오.

### Step 1. 낡은 배너 철거 및 메인 헤더 기능 이관
1. **CSS 수정 (`styles/overrides.css`):**
   * `.second-level-menu` 클래스를 찾아 `display: none !important;` 속성을 부여하여 낡은 탭 메뉴를 화면에서 완전히 증발시키십시오.
2. **JS 수정 (`main.js`):**
   * 지난번에 만든 새로운 Flexbox 헤더 생성 로직 중, 중앙 메뉴 리스트(`ul.boj-menu-list`) 부분을 찾으십시오.
   * 기존 메뉴(문제, 대회, 채점 현황 등) 사이에 **'제출(Submit)'** 이라는 텍스트를 가진 `<li><a href="/problemset/submit">제출</a></li>` 항목을 추가하여, 유저가 언제든 코드를 제출할 수 있도록 보장하십시오.

### Step 2. 가상 테이블 페이지네이션(Pagination) 도입
* **JS 수정 (`src/pages/problemset.js`):**
   1. 컨트롤러 최상단에 `let currentPage = 1;` 이라는 로컬 상태 변수를 선언하십시오.
   2. `handleFilters` 함수 내부에서, 새로운 검색어가 들어와 필터가 갱신될 때마다 반드시 `currentPage = 1;`로 초기화하는 방어 로직을 넣으십시오.
   3. `buildVirtualTable` 함수에서 `problems.slice(...)`를 할 때, 하드코딩된 숫자 대신 `currentPage`와 `Config.MAX_RENDER_COUNT`를 조합한 수학 공식을 사용하여 해당 페이지에 맞는 인덱스만 잘라내도록 수정하십시오.
   4. 가상 테이블의 렌더링 문자열 하단부에, 전체 문제 수(problems.length)를 기반으로 총 페이지 수를 계산하여 버튼들(1, 2, 3...)을 동적으로 생성하는 HTML 조립 로직을 추가하십시오.
   5. 생성된 페이지 버튼들에 클릭 이벤트를 위임(Event Delegation)하여, 클릭된 버튼의 숫자로 `currentPage`를 갱신하고 `buildVirtualTable`을 다시 호출하도록 연결하십시오.

### Step 3. 태그 띄어쓰기 검색 (언더바 치환 전략)
1. **파서 수정 (`src/core/queryParser.js`):**
   * `evaluateToken` 함수 내부에서 `tag:` 접두사(Prefix)를 처리하는 블록을 찾으십시오.
   * `actualToken`에서 `tag:` 부분을 잘라낸 직후, 자바스크립트의 `.replace(/_/g, ' ')` 함수를 사용하여 문자열 내의 모든 언더바를 띄어쓰기로 몰래 바꿔치기하십시오. 그 후 문제의 태그 배열과 대조(Match)시키십시오.
2. **UI 안내 수정 (`src/components/searchBar.js`):**
   * 검색창 렌더링 시 사용되는 `<input>` 태그의 `placeholder` 속성 텍스트를 찾으십시오.
   * 유저가 헷갈리지 않도록 예시 문구를 `태그(tag:brute_force)` 와 같이 언더바를 사용한 형태로 명시적으로 변경하여 안내하십시오.

---

## 📝 3. 시스템 안정성 최종 점검 (Checklist)

* [ ] 기존의 낡은 서브 메뉴(Main, Problems, Submit 등)가 사라지고, 상단의 새 메인 헤더에 '제출' 버튼이 정상적으로 추가되었는가?
* [ ] 검색 결과가 100개를 초과할 때, 테이블 하단에 1, 2, 3.. 형태의 페이지 버튼이 나타나며 클릭 시 다음 100개의 문제로 부드럽게 넘어가는가?
* [ ] 검색창에 `tag:brute_force`를 입력했을 때, 언더바가 띄어쓰기로 치환되어 "brute force" 태그를 가진 문제들이 정확히 검색되는가?