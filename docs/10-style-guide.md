# TodoList 프론트엔드 스타일 가이드

**버전**: 1.0  
**작성일**: 2026-05-28  
**디자인 레퍼런스**: Apple Human Interface Guidelines, Apple.com 디자인 언어  
**참조 문서**: docs/8-wireframes.md (v1.3), docs/2-PRD.md (v2.2)

---

## 디자인 철학

Apple.com의 디자인 언어를 참조한다. 핵심 원칙은 다음과 같다.

- **Clarity**: 불필요한 요소를 제거하고 콘텐츠에 집중한다.
- **Deference**: UI가 콘텐츠를 방해하지 않는다. 배경은 조용하고 전경이 말한다.
- **Depth**: 계층 구조와 공간감을 통해 의미를 전달한다.
- **Generous whitespace**: 요소 간 여백이 곧 레이아웃이다.
- **Systematic typography**: 타이포그래피 계층으로 정보 우선순위를 표현한다.

스크린샷(Apple Mac 제품 페이지)에서 직접 관찰한 설계 패턴:

| 관찰 요소 | 구현 원칙 |
|---|---|
| 순백 배경 + 연회색(`#f5f5f7`) 섹션 | 명확한 영역 구분, 그림자 최소화 |
| 굵고 큰 섹션 헤딩 ("라인업 살펴보기.") | Bold 대형 타이포그래피로 계층 표현 |
| 다크 Pill 탭 (활성) + 라이트 Pill 탭 (비활성) | 필터/세그먼트 컨트롤 패턴 |
| 카드: 흰 배경, 이미지, 제목, 설명 | 정보를 카드 단위로 묶음 |
| 최상단 Nav: blur 반투명, 좌측 로고, 중앙 링크 | 반투명 고정 NavigationBar |
| 색상 dot 캐러셀 인디케이터 | 서브 상태 표현을 점으로 최소화 |

---

## 1. 색상 시스템

### 1.1 시맨틱 색상 토큰

```css
:root {
  /* 배경 */
  --bg-primary:   #ffffff;      /* 주 배경 */
  --bg-secondary: #f5f5f7;      /* 섹션 배경, 카드 배경 */
  --bg-tertiary:  #ffffff;      /* 카드 내부, 입력 필드 */
  --bg-grouped:   #f2f2f7;      /* Grouped List 배경 */

  /* 텍스트 */
  --text-primary:   #1d1d1f;    /* 본문 텍스트 */
  --text-secondary: #86868b;    /* 보조 텍스트, 힌트 */
  --text-tint:      #0071e3;    /* 링크, Tint 버튼 */

  /* 시스템 색상 */
  --color-blue:   #0071e3;      /* Primary CTA, 진행중 */
  --color-green:  #28cd41;      /* 완료 상태, 성공 */
  --color-red:    #ff3b30;      /* 오류, 삭제, 기한초과 */
  --color-orange: #ff9500;      /* 경고, 기한 임박 */
  --color-gray:   #8e8e93;      /* 비활성, 시작 전 */

  /* 구분선 */
  --separator:     #c6c6c8;     /* 1px 구분선 */

  /* 오버레이 */
  --overlay-blur:  rgba(255, 255, 255, 0.72);  /* blur 배경 */
  --overlay-dim:   rgba(0, 0, 0, 0.4);         /* 모달 딤 */
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary:   #000000;
    --bg-secondary: #1c1c1e;
    --bg-tertiary:  #2c2c2e;
    --bg-grouped:   #1c1c1e;

    --text-primary:   #f5f5f7;
    --text-secondary: #ebebf5;
    --text-tint:      #0a84ff;

    --color-blue:   #0a84ff;
    --color-green:  #30d158;
    --color-red:    #ff453a;
    --color-orange: #ff9f0a;
    --color-gray:   #636366;

    --separator:    #38383a;

    --overlay-blur: rgba(28, 28, 30, 0.72);
    --overlay-dim:  rgba(0, 0, 0, 0.6);
  }
}
```

### 1.2 할 일 상태별 색상

| 상태 | 색상 토큰 | Light | Dark | 사용처 |
|---|---|---|---|---|
| `NOT_STARTED` (시작전) | `--color-gray` | `#8e8e93` | `#636366` | 배지, 체크 원형 |
| `IN_PROGRESS` (진행중) | `--color-blue` | `#0071e3` | `#0a84ff` | 배지, 체크 원형 |
| `OVERDUE` (기한초과) | `--color-red` | `#ff3b30` | `#ff453a` | 배지, 체크 원형 |
| `DONE` (완료) | `--color-green` | `#28cd41` | `#30d158` | 배지, 체크 원형 |

### 1.3 사용 금지 색상 패턴

- 커스텀 색상 직접 하드코딩 금지 → 반드시 CSS 변수 사용
- 파란색 계열 색상을 Primary CTA 외에 임의로 사용 금지
- 빨간색을 삭제/오류 이외의 맥락에서 사용 금지

---

## 2. 타이포그래피

### 2.1 폰트 패밀리

```css
:root {
  --font-display: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
                  'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
  --font-text:    -apple-system, BlinkMacSystemFont, 'SF Pro Text',
                  'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
  --font-mono:    'SF Mono', 'SFMono-Regular', 'Menlo', 'Monaco',
                  'Consolas', monospace;
}
```

### 2.2 타이포그래피 스케일

| 토큰 | 폰트 | 크기 | 굵기 | line-height | 용도 |
|---|---|---|---|---|---|
| `--type-large-title` | Display | 34px | 700 | 1.15 | 페이지 진입 Large Title |
| `--type-title-1` | Display | 28px | 700 | 1.2 | 섹션 제목 |
| `--type-title-2` | Display | 22px | 700 | 1.25 | 카드 제목 |
| `--type-title-3` | Display | 20px | 600 | 1.3 | 서브 섹션 제목 |
| `--type-headline` | Text | 17px | 600 | 1.4 | 항목 제목 |
| `--type-body` | Text | 17px | 400 | 1.5 | 본문 |
| `--type-callout` | Text | 16px | 400 | 1.5 | 설명 텍스트 |
| `--type-subheadline` | Text | 15px | 400 | 1.5 | 보조 정보 |
| `--type-footnote` | Text | 13px | 400 | 1.5 | 메타 정보, 글자수 카운터 |
| `--type-caption` | Text | 12px | 400 | 1.4 | 배지, 라벨 |
| `--type-code` | Mono | 13px | 400 | 1.5 | 날짜, 코드 |

```css
:root {
  --type-large-title:  700 34px/1.15 var(--font-display);
  --type-title-1:      700 28px/1.2  var(--font-display);
  --type-title-2:      700 22px/1.25 var(--font-display);
  --type-title-3:      600 20px/1.3  var(--font-display);
  --type-headline:     600 17px/1.4  var(--font-text);
  --type-body:         400 17px/1.5  var(--font-text);
  --type-callout:      400 16px/1.5  var(--font-text);
  --type-subheadline:  400 15px/1.5  var(--font-text);
  --type-footnote:     400 13px/1.5  var(--font-text);
  --type-caption:      400 12px/1.4  var(--font-text);
  --type-code:         400 13px/1.5  var(--font-mono);
}
```

### 2.3 타이포그래피 사용 규칙

- **Large Title**: 페이지 진입 시 노출, 스크롤 시 NavigationBar inline 제목(17px 600)으로 전환
- **letter-spacing**: 대형 헤딩(`type-title-1` 이상)에 `-0.02em` 적용
- **날짜/숫자**: 반드시 `--font-mono` 사용 (고정 폭으로 정렬 유지)
- **truncation**: 단일 줄 항목은 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

---

## 3. 간격 시스템

### 3.1 Spacing 토큰 (8px 그리드)

```css
:root {
  --spacing-xs:  4px;   /* 요소 내부 미세 간격 */
  --spacing-sm:  8px;   /* 관련 요소 간격 */
  --spacing-md:  16px;  /* 기본 패딩, 섹션 내부 패딩 */
  --spacing-lg:  20px;  /* 섹션 간 간격 */
  --spacing-xl:  32px;  /* 페이지 상단 여백 */
  --spacing-2xl: 48px;  /* 페이지 섹션 간 대형 여백 */
}
```

### 3.2 Border Radius 토큰

```css
:root {
  --radius-sm:   8px;     /* 소형 배지, 태그 */
  --radius-md:   12px;    /* 입력 필드, 소형 카드 */
  --radius-lg:   16px;    /* Inset Grouped List 섹션 */
  --radius-xl:   20px;    /* 모달, Bottom Sheet */
  --radius-full: 9999px;  /* Pill 버튼, 토글, Search Bar */
}
```

### 3.3 레이아웃 가이드

| 컨텍스트 | 좌우 패딩 | 최대 너비 |
|---|---|---|
| 모바일 (`< 768px`) | `--spacing-md` (16px) | 100% |
| 태블릿 (`768px~`) | `--spacing-xl` (32px) | 100% |
| 데스크톱 컨텐츠 | `--spacing-xl` (32px) | 1200px |
| 인증 카드 (데스크톱) | - | 480px |
| Sidebar (데스크톱) | - | 200px 고정 |

---

## 4. 컴포넌트

### 4.1 버튼

#### Primary CTA

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  height: 50px;
  padding: 0 var(--spacing-xl);
  background: var(--color-blue);
  color: #ffffff;
  font: var(--type-headline);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: opacity 200ms ease, transform 200ms ease,
              box-shadow 300ms ease;
  min-width: 44px; /* 터치 영역 보장 */
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  opacity: 0.85;
}

.btn-primary:disabled {
  opacity: 0.4;
  pointer-events: none;
}

/* 풀너비 (모바일) */
.btn-primary--full {
  width: 100%;
}
```

#### Secondary (Tint)

```css
.btn-tint {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  height: 44px;
  padding: 0 var(--spacing-md);
  background: transparent;
  color: var(--text-tint);
  font: var(--type-headline);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 200ms ease;
}

.btn-tint:hover {
  background: rgba(0, 113, 227, 0.08);
}
```

#### Destructive

```css
.btn-destructive {
  color: var(--color-red);
  /* 나머지 .btn-tint와 동일 */
}

.btn-destructive:hover {
  background: rgba(255, 59, 48, 0.08);
}
```

#### Pill 필터 탭 (Apple.com 스타일)

스크린샷의 "모든 제품 / 노트북 / 데스크탑 / 디스플레이" 탭 패턴. 할 일 목록의 상태 필터에 동일 패턴 적용.

```css
.filter-tabs {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-tab {
  height: 36px;
  padding: 0 var(--spacing-md);
  background: transparent;
  color: var(--text-primary);
  font: var(--type-subheadline);
  border: 1.5px solid var(--separator);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease,
              border-color 200ms ease;
}

.filter-tab--active {
  background: var(--text-primary); /* 다크 배경 */
  color: var(--bg-primary);        /* 반전 텍스트 */
  border-color: var(--text-primary);
}

/* 다크 모드: 활성 탭은 흰 배경 + 검은 텍스트 */
@media (prefers-color-scheme: dark) {
  .filter-tab--active {
    background: var(--text-primary); /* #f5f5f7 */
    color: var(--bg-primary);        /* #000000 */
  }
}
```

### 4.2 입력 필드

#### Floating Label Input

```css
.input-group {
  position: relative;
}

.input-field {
  width: 100%;
  height: 52px;
  padding: 24px var(--spacing-md) 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font: var(--type-body);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 200ms ease;
}

.input-label {
  position: absolute;
  top: 50%;
  left: var(--spacing-md);
  transform: translateY(-50%);
  color: var(--text-secondary);
  font: var(--type-body);
  pointer-events: none;
  transition: top 200ms cubic-bezier(0.4, 0, 0.2, 1),
              font-size 200ms cubic-bezier(0.4, 0, 0.2, 1),
              color 200ms ease;
}

/* 포커스 또는 값 있을 때: 레이블 위로 */
.input-field:focus ~ .input-label,
.input-field:not(:placeholder-shown) ~ .input-label {
  top: 10px;
  transform: translateY(0);
  font-size: 11px;
  line-height: 1.2;
  color: var(--color-blue);
}

.input-field:focus {
  border-color: var(--color-blue);
}

/* 오류 상태 */
.input-field--error {
  border-color: var(--color-red);
}

.input-field--error ~ .input-label {
  color: var(--color-red);
}

.input-error-message {
  margin-top: var(--spacing-xs);
  font: var(--type-footnote);
  color: var(--color-red);
}
```

#### Textarea (설명 필드)

```css
.textarea-field {
  width: 100%;
  min-height: 80px;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font: var(--type-body);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  outline: none;
  resize: vertical;
  transition: border-color 200ms ease;
}

.textarea-field:focus {
  border-color: var(--color-blue);
}

.char-counter {
  text-align: right;
  font: var(--type-footnote);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.char-counter--exceeded {
  color: var(--color-red);
}
```

#### Search Bar

```css
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  height: 44px;
  padding: 0 var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.search-bar__input {
  flex: 1;
  background: transparent;
  color: var(--text-primary);
  font: var(--type-body);
  border: none;
  outline: none;
}

.search-bar__input::placeholder {
  color: var(--text-secondary);
}
```

### 4.3 카드 (할 일 항목)

```css
.todo-card {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Inset Grouped List 스타일 (목록 컨테이너) */
.list-group {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.list-item {
  padding: var(--spacing-md);
  min-height: 44px; /* 터치 영역 */
}

.list-item + .list-item {
  border-top: 1px solid var(--separator);
  margin-left: var(--spacing-md); /* Inset separator */
}
```

### 4.4 상태 배지

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  height: 20px;
  padding: 0 8px;
  border-radius: var(--radius-full);
  font: var(--type-caption);
  font-weight: 500;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge--not-started {
  color: var(--color-gray);
  background: rgba(142, 142, 147, 0.1);
}

.status-badge--in-progress {
  color: var(--color-blue);
  background: rgba(0, 113, 227, 0.1);
}

.status-badge--overdue {
  color: var(--color-red);
  background: rgba(255, 59, 48, 0.1);
}

.status-badge--done {
  color: var(--color-green);
  background: rgba(40, 205, 65, 0.1);
}
```

### 4.5 원형 체크버튼

```css
.check-circle {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-gray);
  background: transparent;
  cursor: pointer;
  transition: border-color 200ms ease, background 200ms ease;
  /* 터치 영역 확장 */
  position: relative;
}

.check-circle::after {
  content: '';
  position: absolute;
  inset: -10px;
  /* 44×44px 터치 영역 보장 */
}

.check-circle--done {
  border-color: var(--color-green);
  background: var(--color-green);
  /* 체크마크 아이콘 또는 ◉ 표시 */
}
```

### 4.6 NavigationBar

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 52px;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  background: var(--overlay-blur);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid transparent;
  transition: border-color 200ms ease;
}

/* 스크롤 시 separator 노출 */
.navbar--scrolled {
  border-bottom-color: var(--separator);
}

.navbar__title {
  font: var(--type-headline);
  color: var(--text-primary);
}
```

### 4.7 모달 / Bottom Sheet

#### 모달 오버레이

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-dim);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### Center Modal (데스크톱)

```css
.modal-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.24);
  animation: modalEnter 350ms cubic-bezier(0.5, 0, 0.2, 1);
}

@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
```

#### Bottom Sheet (모바일)

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--spacing-md) var(--spacing-md)
           calc(var(--spacing-md) + env(safe-area-inset-bottom));
  animation: sheetEnter 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-sheet__grabber {
  width: 36px;
  height: 4px;
  background: var(--separator);
  border-radius: var(--radius-full);
  margin: 0 auto var(--spacing-md);
}

@keyframes sheetEnter {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
```

### 4.8 Toast 알림

```css
.toast {
  position: fixed;
  top: calc(52px + var(--spacing-md)); /* navbar 아래 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  padding: 12px var(--spacing-md);
  background: var(--text-primary);
  color: var(--bg-primary);
  font: var(--type-subheadline);
  font-weight: 500;
  border-radius: var(--radius-full);
  white-space: nowrap;
  animation: toastEnter 250ms ease-out;
}

@keyframes toastEnter {
  from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

### 4.9 Sidebar (데스크톱)

```css
.sidebar {
  width: 200px;
  min-height: 100vh;
  background: var(--overlay-blur);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid var(--separator);
  padding: var(--spacing-xl) var(--spacing-sm);
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  height: 36px;
  padding: 0 var(--spacing-md);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font: var(--type-subheadline);
  cursor: pointer;
  transition: background 200ms ease;
}

.sidebar__item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sidebar__item--active {
  background: var(--color-blue);
  color: #ffffff;
}
```

### 4.10 TabBar (모바일)

```css
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  background: var(--overlay-blur);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid var(--separator);
  z-index: 100;
}

.tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-secondary);
  font: var(--type-caption);
  cursor: pointer;
  transition: color 200ms ease;
  min-height: 44px;
}

.tabbar__item--active {
  color: var(--color-blue);
}
```

### 4.11 DatePicker 달력

```css
.datepicker {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  animation: popoverEnter 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes popoverEnter {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.calendar__day {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: var(--type-body);
  border-radius: 50%;
  cursor: pointer;
  transition: background 150ms ease;
}

.calendar__day--today {
  border: 1.5px solid var(--color-blue);
}

.calendar__day--selected {
  background: var(--color-blue);
  color: #ffffff;
}

.calendar__day--in-range {
  background: rgba(0, 113, 227, 0.1);
  border-radius: 0;
}
```

### 4.12 Skeleton 로딩

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    rgba(0, 0, 0, 0.04) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

@media (prefers-color-scheme: dark) {
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--bg-secondary) 25%,
      rgba(255, 255, 255, 0.06) 50%,
      var(--bg-secondary) 75%
    );
    background-size: 200% 100%;
  }
}
```

---

## 5. 애니메이션

### 5.1 애니메이션 토큰

```css
:root {
  /* 지속 시간 */
  --duration-fast:   150ms;  /* 마이크로 인터랙션 */
  --duration-base:   300ms;  /* 표준 트랜지션 */
  --duration-slow:   500ms;  /* 복잡한 애니메이션 */

  /* Easing */
  --ease-spring:   cubic-bezier(0.4, 0, 0.2, 1);  /* 기본 spring */
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);     /* 등장 */
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);     /* 퇴장 */
  --ease-standard: ease-in-out;                    /* 토글 */
}
```

### 5.2 모션 패턴별 적용

| 트리거 | 지속 시간 | Easing | 속성 |
|---|---|---|---|
| 버튼 hover | `150ms` | `ease` | `transform`, `box-shadow` |
| 버튼 active | `100ms` | `ease-in` | `transform`, `opacity` |
| 리스트 항목 등장 | `300ms` | `--ease-out` | `opacity`, `translateY` |
| Bottom Sheet 슬라이드업 | `400ms` | `--ease-spring` | `translateY` |
| Center Modal 등장 | `350ms` | `--ease-spring` | `opacity`, `scale` |
| Toast 슬라이드다운 | `250ms` | `--ease-out` | `opacity`, `translateY` |
| Context Menu 팝업 | `280ms` | `--ease-spring` | `opacity`, `scale` |
| DatePicker 팝오버 | `200ms` | `--ease-spring` | `opacity`, `scale` |
| Floating Label 이동 | `200ms` | `--ease-spring` | `top`, `font-size` |
| Skeleton shimmer | `1500ms` | `linear` (반복) | `background-position` |
| 필터 탭 전환 | `200ms` | `--ease-standard` | `background`, `color` |

### 5.3 접근성 — 모션 축소

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.4 성능 원칙

- **GPU 가속 속성만 애니메이션**: `transform`, `opacity` 사용
- `width`, `height`, `top`, `left` 직접 애니메이션 금지
- `will-change` 는 실제 필요한 요소에만 한정적으로 사용

---

## 6. 반응형 레이아웃

### 6.1 브레이크포인트

```css
/* Mobile */
@media (max-width: 767px) { ... }

/* Tablet & Desktop */
@media (min-width: 768px) { ... }

/* Large Desktop */
@media (min-width: 1280px) { ... }
```

### 6.2 레이아웃 전환

| 화면 | 네비게이션 | 콘텐츠 |
|---|---|---|
| `< 768px` | 하단 TabBar (5탭) | 단일 컬럼, 풀너비 |
| `≥ 768px` | 좌측 Sidebar (200px) | 메인 콘텐츠 영역 |

### 6.3 인증 화면

- Sidebar / TabBar 없음
- 중앙 정렬 카드 레이아웃
- 데스크톱: `max-width: 480px`, `border-radius: var(--radius-xl)`
- 모바일: 좌우 `var(--spacing-md)` margin, 풀너비

---

## 7. 접근성

### 7.1 색상 대비

| 요소 | 요구 기준 | 달성 방법 |
|---|---|---|
| 본문 텍스트 | 4.5:1 이상 (WCAG AA) | `--text-primary` on `--bg-primary` |
| 보조 텍스트 | 3:1 이상 (WCAG AA Large) | `--text-secondary` on `--bg-secondary` |
| 버튼 텍스트 | 4.5:1 이상 | 흰 텍스트 on `--color-blue` |
| 오류 메시지 | 4.5:1 이상 | `--color-red` on `--bg-primary` |

### 7.2 터치/클릭 영역

- **최소 44×44px** 모든 인터랙티브 요소
- 시각적 크기가 작은 요소는 CSS `padding` 또는 `::after` 확장으로 영역 확보

### 7.3 키보드 내비게이션

```css
/* 포커스 링 (기본 outline 대체) */
:focus-visible {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* 마우스 클릭 시 포커스 링 숨김 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 7.4 ARIA 레이블

- 아이콘 전용 버튼: 반드시 `aria-label` 또는 `aria-describedby` 부여
- 상태 배지: `role="status"` 또는 스크린리더 전용 텍스트 제공
- 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 적용

---

## 8. 아이콘

### 8.1 사용 아이콘 라이브러리

SF Symbol 스타일을 참조하는 오픈소스 아이콘 라이브러리 사용.  
권장: **Lucide React** (SF Symbol과 유사한 선형 스타일)

```tsx
import { Plus, Search, Settings, Calendar, Tag, Check, Trash2, Pencil } from 'lucide-react';
```

### 8.2 아이콘 크기

| 컨텍스트 | 크기 | 터치 영역 |
|---|---|---|
| NavigationBar 버튼 | 20×20px | 44×44px (padding으로 확장) |
| 리스트 항목 | 18×18px | 44×44px |
| 배지 내부 | 12×12px | N/A |
| TabBar | 24×24px | 44px 탭 영역 내 |

---

## 9. Tailwind CSS 설정

프로젝트는 Tailwind CSS v4를 사용하며, CSS 변수와 연동하여 사용한다.

```css
/* tailwind.config 대신 CSS @theme 사용 (Tailwind v4) */
@theme {
  --color-bg-primary:   var(--bg-primary);
  --color-bg-secondary: var(--bg-secondary);
  --color-text-primary: var(--text-primary);
  --color-blue:         var(--color-blue);
  --color-green:        var(--color-green);
  --color-red:          var(--color-red);
  --color-orange:       var(--color-orange);
  --color-gray:         var(--color-gray);

  --radius-sm:   var(--radius-sm);
  --radius-md:   var(--radius-md);
  --radius-lg:   var(--radius-lg);
  --radius-xl:   var(--radius-xl);
  --radius-full: var(--radius-full);

  --font-sans: var(--font-text);
  --font-mono: var(--font-mono);
}
```

---

## 10. React 컴포넌트 인터페이스 규약

### 10.1 공통 Props 패턴

```tsx
// 상태 배지
type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'OVERDUE' | 'DONE';

interface StatusBadgeProps {
  status: TodoStatus;
}

// 버튼
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'tint' | 'destructive';
  fullWidth?: boolean;
  loading?: boolean;
}

// 입력 필드
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}
```

### 10.2 테마 전환

```tsx
// useTheme.ts — Zustand store에서 theme 읽어 HTML data attribute 적용
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme); // 'LIGHT' | 'DARK'
}, [theme]);

/* CSS */
[data-theme='DARK'] {
  color-scheme: dark;
  /* 다크 모드 토큰 재정의 */
}
```

> **prefers-color-scheme** 미디어 쿼리를 기본으로 하되, 사용자 설정(`theme: 'LIGHT' | 'DARK'`)이 존재하면 `data-theme` attribute로 오버라이드한다.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-05-28 | 최초 작성 (Apple.com 디자인 레퍼런스 기반) |
