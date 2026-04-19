# 🛠️ Codeforces 백준화 프로젝트: v3.0 마이그레이션 및 파일 구조 재설계 명세서

본 문서는 레거시 단일 파일(Monolithic) 구조에서 미래지향적 컴포넌트 기반 아키텍처(Modular Architecture)로 전환하기 위한 마이그레이션 작업 지침서입니다. 기존의 모든 방어 로직과 기능이 유실 없이 안전하게 이관되도록 설계되었습니다.

---

## 1. 무손실 마이그레이션 로직 검증 (Logic Mapping Check)

기존 스크립트에 혼재되어 있던 기능들이 새 아키텍처의 어느 모듈로 이관되는지 점검한 내역입니다. 누락된 로직은 0건입니다.

| 기존 기능 (Legacy Logic) | 이관 대상 모듈 (New Component/Module) | 마이그레이션 상세 및 최적화 포인트 |
| :--- | :--- | :--- |
| **100점 단위 티어 매핑** | `src/core/tierCalculator` | 순수 논리 함수로 분리하여 Problem, Profile 등 모든 페이지에서 import 하여 재사용. |
| **API 15분 로컬 캐싱** | `src/api/fetcher` | 통신 전담 모듈로 격리. 에러 핸들링(429, 500) 및 Promise 반환 로직 일원화. |
| **다크모드 토글 스위치** | `src/components/themeToggle` | UI 렌더링 및 이벤트 리스너 전담 컴포넌트로 분리. |
| **깜빡임(FOUC) 방지** | `theme-init.js` | 모듈 번들링에서 제외하여 HTML `<head>` 로드 시 최우선 실행되도록 격리. |
| **검색창 UI 및 입력 감지** | `src/components/searchBar` | 디바운스(Debounce) 및 XSS 방어(Sanitizer) 로직을 내장하여 안전한 텍스트만 추출. |
| **알약(Pill) 생성 및 삭제** | `src/components/pillContainer` | 이벤트 위임(Event Delegation) 패턴을 적용하여 메모리 누수 원천 차단. |
| **검색어 파싱 (solved.ac 문법)**| `src/core/queryParser` | AST 파싱 로직 분리. DOM과 무관하게 문자열만 분석하여 평가 함수를 반환하도록 순수 함수화. |
| **DOM 렌더링 최적화 (Batch)** | `src/pages/problemset` | `StateManager`를 구독하여 상태 변경 시 메모리 인덱싱 기반으로 `display: none` 클래스 일괄 적용. |
| **AJAX 갱신 감지** | `src/utils/domObserver` | 싱글톤 패턴으로 단 1개의 감시자만 가동하며, 변경 발생 시 페이지 컨트롤러에 브로드캐스트. |
| **태그 스포일러 방지 토글** | `src/components/spoilerToggle`| 개별 문제 페이지 전용 컴포넌트로 격리. 기존 태그 수집 및 블라인드 처리 전담. |

---

## 2. 파일 구조 대개편 (File Structure Transformation)

기존의 비대해진 파일들을 전면 삭제(해체)하고, 역할별로 명확히 분리된 새 디렉토리 구조를 도입합니다.

### 🗑️ 삭제되는 레거시 파일들 (Deleted)
역할이 비대해져 유지보수가 불가능했던 기존 스크립트와 스타일시트입니다.
- `scripts/utils.js` (기능이 너무 많이 섞인 유틸 파일)
- `scripts/problemset.js` (검색, DOM 조작, 옵저버가 혼재된 스파게티 파일)
- `scripts/problem.js` (단일 스크립트)
- `styles/problemset.css` (변수와 덮어쓰기가 혼재된 CSS)

### 🆕 새롭게 추가되는 구조 및 파일들 (Added)
웹팩(Webpack)이나 ES Modules 환경에서 조립될 수 있도록 역할이 완벽히 쪼개진 모듈들입니다.

- **`src/core/` (핵심 비즈니스 로직)**
  - `tierCalculator.js`
  - `queryParser.js`
  - `stateManager.js` (필터 상태, 테마 상태 등을 관리하는 전역 저장소)
- **`src/api/` (네트워크)**
  - `fetcher.js` (캐싱 및 통신)
- **`src/components/` (재사용 가능한 UI 조각)**
  - `searchBar.js`
  - `pillContainer.js`
  - `themeToggle.js`
  - `spoilerToggle.js`
- **`src/pages/` (페이지별 뷰 컨트롤러)**
  - `problemset.js` (Problemset 페이지 마운트 및 렌더링 총괄)
  - `problem.js` (개별 문제 페이지 마운트)
  - `profile.js` (유저 프로필 페이지 마운트)
- **`src/utils/` (도우미 함수)**
  - `domObserver.js` (DOM 감시)
  - `debounce.js` (입력 지연)
  - `sanitizer.js` (XSS 방어)
- **`styles/` (스타일시트 분리)**
  - `variables.css` (테마, 색상 등 CSS 변수 선언)
  - `components.css` (우리가 주입하는 UI의 고유 스타일)
  - `overrides.css` (코드포스 레거시 레이아웃 강제 덮어쓰기 전용)
- **`theme-init.js`** (루트 디렉토리에 위치, 화면 렌더링 전 최우선 실행)

### 🔄 업데이트 되는 파일 (Updated)
- **`manifest.json`**
  - 기존 단일 스크립트 참조 방식에서, 새롭게 쪼개진 모듈들의 로딩 순서를 엄격하게 정의합니다.
  - **스크립트 로딩 순서:** `theme-init.js` -> `utils/` -> `core/` -> `api/` -> `components/` -> `pages/` 순으로 의존성 에러가 나지 않도록 재배치합니다.
  - **CSS 로딩 순서:** `variables.css` -> `components.css` -> `overrides.css` 순으로 적용하여 명시도 충돌을 방지합니다.

---

## 3. 리팩토링 기대 효과 (Architectural Benefits)

1. **사이드 이펙트(Side-effect) 완전 차단:** 검색바 UI를 수정하다가 AJAX 옵저버가 고장나는 등의 연쇄 버그가 발생하지 않습니다. 컴포넌트가 완전히 격리되어 있기 때문입니다.
2. **무한 확장성 보장:** 향후 '랜덤 디펜스' 기능이 추가된다면, 기존 코드를 건드릴 필요 없이 `src/components/randomDefense.js`를 하나 만들어서 `problemset.js`에 끼워 넣기만 하면 됩니다.
3. **렌더링 성능 극대화:** DOM 조작 로직이 `pages` 디렉토리 하위의 뷰 컨트롤러에 집중되고, `stateManager`가 상태 변경을 일괄 브로드캐스팅하여 브라우저의 화면 갱신 부하(Reflow)를 최소화합니다.