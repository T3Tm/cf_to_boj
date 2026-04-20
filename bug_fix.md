# 🏆 Codeforces to Baekjoon (v3.15 Event Lifecycle & Theme Master)

본 명세서는 v3.10의 헤더 재건축 및 v3.12의 검색창 개편 이후 발생한 **'테마 전환 버튼 먹통'**, **'검색 버튼 클릭 무반응'**, **'알약(Pill) 삭제 불가'** 현상의 근본 원인인 DOM 생명주기(Lifecycle) 충돌을 완벽히 교정하는 최종 핫픽스 지침서입니다.

---

## 🚨 1. 치명적 버그 원인 분석 및 5회 교차 검증 (Deep Debugging)

### ① 테마 전환 버튼이 먹통인 진짜 이유 (The Theme Button)
* **원인 파악:** v3.10에서 우리는 `main.js`를 통해 헤더(`.boj-header-right`)에 테마 전환 버튼의 HTML(`<button id="boj-theme-toggle">...`)을 문자열로 때려 넣었습니다. 그리고 그 직후에 `ThemeToggle.init()`을 호출했습니다. 
* **충돌 지점:** `themeToggle.js`의 `init()` 함수 내부를 보면, 옛날 버전의 잔재인 **"`.lang-chooser`를 찾아서 그 안에 새로운 버튼 요소를 `createElement`로 만들어 넣어라"** 라는 로직이 그대로 남아있었습니다. 즉, `main.js`가 만들어준 버튼과, `themeToggle.js`가 찾으려는 요소가 완전히 엇갈려, 이벤트 리스너(onclick)가 허공에 등록되고 있었던 것입니다.
* **해결 설계:** `themeToggle.js`의 역할을 완전히 수정합니다. "버튼을 새로 만드는 것"이 아니라, `main.js`가 이미 화면에 그려놓은 `document.getElementById('boj-theme-toggle')` 요소를 **찾아서(Query) 클릭 이벤트만 매핑(Mapping)** 해주는 역할로 축소해야 합니다.

### ② 검색창 클릭 이벤트와 알약 삭제가 죽어버린 이유 (The Search & Pills)
* **원인 파악:** `searchBar.js` 역시 `innerHTML`로 뼈대를 주입합니다. 이때 자바스크립트 엔진은 HTML 문자열을 파싱하여 새로운 DOM 객체들을 만듭니다. 만약 `innerHTML` 주입 로직 **이전에** 요소를 찾거나(`getElementById`), 이벤트 위임을 부착했다면, 렌더링 이후 그 요소들은 옛날 메모리 주소를 바라보는 **좀비 객체(Stale Reference)**가 되어버립니다.
* **해결 설계 (순서 강제):** 1. `searchBar.js`: 반드시 `insertBefore` 등을 통해 DOM에 HTML을 완전히 삽입(Mount)한 **직후(마지막 줄)에** 요소를 쿼리하여 이벤트를 달아주어야 합니다.
  2. `pillContainer.js`: 컨테이너가 렌더링될 때마다 매번 이벤트를 다는 것이 아니라, 최초 1회 빈 컨테이너(`div#boj-selected-pills`)를 생성하여 화면에 붙인 직후에 딱 한 번만 이벤트 위임(Event Delegation)을 걸어두어야 합니다. 이후에는 안의 알약(`span`, `button`)만 넣었다 뺐다 해야 이벤트가 유지됩니다.

---

## 🛠️ 2. 아키텍처 개편 및 조치 지침 (Implementation Guide)

개발자님께서는 코드를 직접 수정하실 때 아래의 흐름을 엄격하게 따라 주십시오.

### Step 1. `src/components/themeToggle.js` (테마 이벤트 복구)
1. `init` 함수 내부의 로직을 전면 수정합니다.
2. 기존의 `document.querySelector('.lang-chooser')`나 `document.createElement('button')` 같은 로직을 모두 삭제하십시오.
3. 대신, `document.getElementById('boj-theme-toggle')`를 통해 메인 헤더에 존재하는 버튼을 찾으십시오.
4. 버튼이 존재한다면, 해당 버튼의 `onclick` 속성에 테마를 스위칭하는 로직(상태 관리자의 `theme` 값을 읽어와 반대로 `setTheme` 호출)을 할당하십시오.

### Step 2. `src/components/searchBar.js` (검색 이벤트 복구)
1. `init` 함수 내부의 실행 순서를 점검하십시오.
2. `searchUI.innerHTML = ...` 을 통해 뼈대를 만들고, `containerElement.insertBefore(...)`를 통해 화면에 그리는 로직이 **무조건 가장 먼저** 실행되어야 합니다.
3. 화면에 그려진 이후(하단부)에 `document.getElementById('boj-search-input')`과 `document.getElementById('boj-search-btn')`을 변수에 담으십시오.
4. 그 다음, 해당 변수들에 `addEventListener`를 사용하여 `keyup(Enter)`와 `click` 이벤트를 매핑하십시오.

### Step 3. `src/components/pillContainer.js` (알약 삭제 복구)
1. `init` 함수를 점검하십시오. 
2. `containerElement = document.createElement('div');` 로 컨테이너를 만들고, `searchContainer.appendChild(containerElement);` 로 화면에 붙이는 작업이 이루어집니다.
3. **이 직후에 단 한 번만** `containerElement.addEventListener('click', ...)` 를 통해 이벤트 위임을 설정해야 합니다. (`render` 함수 내부가 아닌 `init` 함수 내부에 있어야 합니다.)
4. 클릭된 요소(`e.target`)의 클래스리스트가 `boj-pill-remove`를 포함하고 있다면, 해당 요소의 `data-val` 속성값을 읽어 상태 관리자의 `removeFilter`를 호출하도록 로직을 점검하십시오.

---

## 📝 3. 시스템 안정성 최종 점검 (Checklist)

* [ ] 우측 상단의 🌓 테마 전환 버튼을 클릭했을 때 화면이 어두워지고 밝아지는 다크모드가 정상 작동하는가?
* [ ] 검색창에 텍스트를 입력하고 '엔터키'가 아닌 마우스로 '검색' 버튼을 클릭했을 때 정상적으로 알약이 생성되는가?
* [ ] 생성된 알약 옆의 'X' 버튼을 마우스로 클릭했을 때 알약이 즉시 사라지고 필터가 해제되는가?