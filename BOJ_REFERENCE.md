# 🏛️ Baekjoon Online Judge (BOJ) UI/UX Standard Reference

본 문서는 백준(BOJ) 및 solved.ac의 실제 웹 페이지 구조와 스타일을 정밀 분석한 명세서입니다. 모든 `overrides.css` 및 페이지 컨트롤러 로직은 본 명세를 절대적으로 준수하며, 임의의 변경을 금지합니다.

---

## 🎨 1. 전역 디자인 토큰 (Global Design Tokens)

| 요소 (Element) | 색상값 (HEX) | 비고 |
| :--- | :--- | :--- |
| **Primary Blue** | `#0076ba` | 브랜드 시그니처, 탭 활성화, 링크 |
| **Success Green** | `#00985b` | "맞았습니다!!" 결과 |
| **Danger Red** | `#dd4124` | "틀렸습니다" 결과 |
| **Warning Orange** | `#fa7268` | 시간/메모리 초과 |
| **Neutral Grey** | `#333333` | 기본 텍스트 |
| **Light Grey** | `#888888` | 보조 텍스트, 힌트 |
| **Border Color** | `#dddddd` | 테이블, 섹션 구분선 |
| **BG Header** | `#f9f9f9` | 테이블 헤더(th), 옅은 배경 |

---

## 🏗️ 2. 페이지별 표준 구조 (Page Structures)

### ① 문제 페이지 (Problem)
*   **상단 메뉴:** `ul.nav-tabs` (border-bottom: 1px solid #ddd)
*   **제목:** `div.page-header` > `h1#problem_title` (font-size: 32px, font-weight: bold)
*   **정보 테이블:** `table#problem-info` (width: 100%, text-align: center)
*   **본문 섹션:** `section#description`, `section#input`, `section#output`
    *   `div.headline` > `h2` (color: #0076ba, border-bottom: 2px solid #0076ba)
*   **예제:** `div.row` > `div.col-md-6` (2분할 레이아웃)
    *   `pre.sampledata` (bg: #f5f5f5, border: 1px solid #ccc, font: Menlo/Monaco)

### ② 제출 페이지 (Submit)
*   **폼 컨테이너:** `form#submit-form`
*   **언어 선택:** `select#language` (width: 100%, max-width: 400px)
*   **에디터:** `textarea#source` (width: 100%, height: 500px, bg: #fff, border: 1px solid #ccc)
*   **제출 버튼:** `button#submit_button` (bg: #337ab7, color: #fff, padding: 10px 30px)

### ③ 채점 현황 (Status)
*   **결과 텍스트:** 
    *   `.result-ac`: `#00985b` (Bold)
    *   `.result-wa`: `#dd4124`
    *   `.result-tle`, `.result-mle`: `#fa7268`
*   **테이블:** `table#status-table` (Zebra Striping: even rows `#f9f9f9`)

### ④ 유저 프로필 (Profile)
*   **프로필 헤더:** `div.page-header`
    *   `h1`: 유저 아이디와 티어 아이콘 (`img.tier-icon` 가로 20px, 세로 25px 내외)
*   **통계 테이블:** `table#statics` (격자 및 줄무늬 효과)
    *   항목: 등수, 맞은 문제, 시도했지만 맞지 못한 문제, 제출
*   **결과 통계:** `table` 내부에 `맞았습니다`, `틀렸습니다` 등 세부 항목 표시
*   **문제 리스트:** `div.problem-list` (해결한 문제 번호들이 공백을 두고 나열됨)

---

## 📏 3. 레이아웃 상세 규격 (Layout Constraints)

*   **Max Width:** `#pageContent`는 최대 `1140px`로 고정하며 중앙 정렬합니다.
*   **Padding:** 각 섹션 간의 수직 간격은 최소 `30px` 이상 유지합니다.
*   **Font Family:** `Apple SD Gothic Neo`, `Noto Sans KR`, `sans-serif`를 기본으로 사용합니다.
*   **Icon Size:** 티어 아이콘은 문제 목록에서 `18px`, 프로필에서 `24px`로 고정합니다.

---

## 🔒 4. 고정 규칙 (Immutability Rules)
1.  **!important 금지:** 본 명세에 따라 명시도가 높은 셀렉터를 사용하여 `!important` 없이 스타일을 제압합니다.
2.  **색상 변수 사용:** 모든 CSS는 `variables.css`에 정의된 변수만 사용하며 하드코딩된 HEX값을 지양합니다.
3.  **반응형 대응:** 1140px 이하에서는 `width: 100%`로 유연하게 대응합니다.
