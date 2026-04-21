# 🐛 Bug Fix Report (v4.0.0 "Final Refinement")

## 1. 코드포스 레거시 메뉴 및 바 삭제
- **문제:** 커스텀 헤더 주입 후에도 코드포스의 2차 메뉴(`.second-level-menu`)와 각종 포커스 링크들이 노출되어 UI가 난잡해짐.
- **해결:** `overrides.css`에서 해당 클래스들을 `display: none !important`로 강제 제압하여 백준 스타일의 깔끔한 상단 바를 유지함.

## 2. 문제 목록 원본 테이블 완전 은폐
- **문제:** 가상 테이블(Virtual Table)이 렌더링된 후에도 코드포스의 원본 문제 테이블이 하단에 남아있거나 깜빡이며 노출됨.
- **해결:** 
    - `overrides.css`에 가상 테이블이 아닐 경우 `.datatable`을 숨기는 정밀 셀렉터 추가.
    - `problemset.js`의 `buildVirtualTable` 로직 내에 원본 테이블을 명시적으로 찾아 `display: none` 처리하는 안전장치 마련.

## 3. 문제 목록 아이콘 및 정렬 최적화
- **문제:** 티어 아이콘의 크기가 일정하지 않고, 텍스트와 수직 정렬이 맞지 않아 시각적으로 불편함.
- **해결:** 
    - `problemset.js`에서 아이콘 크기를 `18px`로 고정하고 `vertical-align: middle` 적용.
    - 테이블 각 열의 너비(`width`)를 고정하여 페이지 전환 시에도 컬럼 위치가 변하지 않도록 고정 레이아웃 적용.

## 5. 테마 전환 기능 정상화
- **문제:** 테마 토글 버튼 클릭 시 `StateManager`와 `Settings` 간의 불일치로 인해 실제 다크모드가 반영되지 않음.
- **해결:** 
    *   `ThemeToggle.js`를 `Settings` 기반으로 전면 리팩토링하여 상태 변경 시 `document.documentElement`를 즉시 조작함.
    *   `inject.js`에서 `localStorage` 기반 부트스트랩 로직을 강화하여 초기 로딩 속도 및 안정성 확보.

## 7. Problem 페이지 런타임 에러(TypeError) 수정
- **문제:** `problem.js`에서 `Fetcher`가 반환한 객체를 배열로 오인하여 `.find()` 함수 호출 시 `TypeError: allProbs.find is not a function` 발생. 이로 인해 이후의 모든 UI 변환 로직이 중단됨.
- **해결:** 코드포스 API 구조에 맞춰 `allProbs.problemStatistics` 배열에 접근하여 데이터를 검색하도록 로직을 교정함.
