# 🐛 Bug Fix Report (v3.6.0)

## 1. 필터링 로직 전면 개편 (내 제출 및 문제별 현황)
- **증상:** '내 제출' 체크박스가 작동하지 않거나, 특정 문제의 채점 현황임에도 모든 문제의 결과가 표시됨.
- **원인:** 
    - URL 파라미터(`handle`)를 조작할 때 기존의 다른 필터(문제 인덱스 등)가 유실됨.
    - `src/pages/problem.js`에서 채점 현황 링크가 `contestId`와 `index`를 정확히 전달하지 못함.
- **해결:** 
    - `URLSearchParams`를 사용하여 기존 쿼리 스트링을 보존하며 `handle`, `friends` 파라미터만 토글하도록 수정함.
    - `src/pages/status.js`에서 `contestId`와 `index`를 분석하여 해당 문제의 결과만 필터링되도록 보장함.

## 2. 백준 스타일 채점 현황 UI 완성 (Perfect Clone)
- **증상:** UI가 여전히 코드포스 고유의 스타일을 유지하여 일질감이 느껴짐.
- **해결:** 
    - `overrides.css`에 백준 특유의 회색 헤더, 초록색/빨간색 결과 텍스트, 줄무늬 행 스타일을 추가함.
    - 테이블 내 영문 텍스트(Accepted, Wrong Answer 등)를 '맞았습니다!!', '틀렸습니다' 등 백준 용어로 한국어 번역함.
    - 아이디와 문제명 컬럼을 왼쪽 정렬하여 백준과의 시각적 동질성을 높임.

## 3. 강력한 요소 클리너 및 가시성 확보
- **증상:** "My only", "Friends only" 등 네이티브 스위치가 사라지지 않거나 테이블이 숨겨짐.
- **해결:** 
    - `friendsEnabledSwitch`, `myEnabledSwitch` 등 특정 클래스를 가진 컨테이너를 명시적으로 제거함.
    - CSS `!important` 사용을 최소화하기 위해 JS에서 `style.setProperty`를 전략적으로 활용하여 테이블 가시성을 강제 확보함.
    - `DOMObserver`를 통해 동적 갱신 시에도 클린업 로직이 상시 작동하도록 설계함.
