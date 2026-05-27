# TodoList 프로젝트 구조 설계 원칙

버전: 1.1
작성일: 2026-05-27
참조 문서: docs/1-domain-definition.md (v2.1), docs/2-PRD.md (v2.1), docs/3-user-scenarios.md (v1.3)

---

## 1. 공통 최상위 원칙

모든 스택(프론트엔드, 백엔드)에 적용되는 핵심 원칙이다.

### 1-1. 단일 책임 원칙

파일, 함수, 컴포넌트는 하나의 역할만 수행한다. `todoService.js`는 비즈니스 로직만, `todoRepository.js`는 DB 쿼리만 담는다. 하나의 파일이 두 가지 이상의 책임을 지게 되는 순간 분리를 검토한다.

### 1-2. 명시적 의존성

암묵적인 글로벌 상태와 사이드이펙트를 피한다. 의존성은 함수 인자나 컨텍스트를 통해 명시적으로 전달한다. 예를 들어 `statusCalculator`가 현재 날짜를 전역에서 읽지 않고 인자(`today`)로 받는 것이 이 원칙의 적용 사례다.

### 1-3. 보안 기본값

모든 DB 쿼리는 parameterized query를 사용한다. 모든 API 엔드포인트는 기본적으로 JWT 인증을 요구하며, 인증이 불필요한 엔드포인트(회원가입, 로그인)는 라우터 파일에 명시적으로 주석 처리한다.

### 1-4. 최소 추상화

한 번만 사용되는 코드를 위해 추상화 계층을 만들지 않는다. 반복이 확인된 시점에 추상화한다.

### 1-5. 타입 안정성

프론트엔드는 TypeScript strict 모드를 사용한다. 백엔드는 JavaScript이므로 JSDoc 또는 zod로 주요 함수의 입출력 타입을 명세한다. `any` 타입 사용을 원칙적으로 금지하며, 불가피한 경우 해당 라인에 사유를 주석으로 기재한다.

### 1-6. 계층 간 단방향 의존

프론트엔드와 백엔드 모두 상위 계층이 하위 계층에만 의존한다. 하위 계층이 상위 계층을 참조하거나 순환 의존이 발생하는 구조를 허용하지 않는다.

### 1-7. 환경 분리

비밀번호, DB URL, JWT_SECRET 등 민감 정보는 코드에 하드코딩하지 않는다. 반드시 환경 변수로 관리하며, `.env` 파일은 `.gitignore`에 포함한다.

### 1-8. 오류는 경계에서 처리

오류 처리는 각 계층의 경계(Controller, API Client)에서 수행한다. Service나 Repository는 오류를 그대로 throw하고, Controller 또는 전역 에러 핸들러가 최종 HTTP 응답으로 변환한다.

### 1-9. 상태 계산의 단일 출처

할 일 상태(`NOT_STARTED`, `IN_PROGRESS`, `OVERDUE`)는 백엔드 Service 레이어에서만 계산한다. 프론트엔드는 API 응답에 포함된 계산 결과를 그대로 사용하며, 프론트엔드에서 상태를 재계산하지 않는다.

**계산 시점 정책**: 상태는 DB에 저장하지 않는다. 목록 조회 API(`GET /todos`) 요청이 들어올 때마다 Service 레이어가 `statusCalculator.js`를 호출하여 현재 서버 UTC 기준으로 즉시 계산하고 응답에 포함한다. DB의 `status` 컬럼에는 사용자가 명시적으로 지정한 `DONE` 값만 저장하며, `NOT_STARTED` / `IN_PROGRESS` / `OVERDUE`는 DB에 저장하지 않는다. (R-STA-01~04)

**`todos.status` 컬럼 처리 방식**: 컬럼 타입은 `VARCHAR`, 기본값은 `NULL`이다. 할 일 생성(INSERT) 시 `status`를 명시하지 않으면 NULL로 저장되고, 완료 처리(PATCH) 시 `'DONE'`으로 업데이트한다. `statusCalculator.js`는 `todo.status === 'DONE'`이면 `'DONE'`을 즉시 반환하고, 그 외에는 `start_date` / `end_date`와 `today`를 비교하여 `NOT_STARTED` / `IN_PROGRESS` / `OVERDUE` 중 하나를 반환한다.

### 1-10. i18n 하드코딩 금지

프론트엔드에서 사용자에게 노출되는 모든 텍스트는 `useTranslation` 훅을 통해 번역 키로 참조한다. 컴포넌트 파일 내 한국어 또는 영어 문자열 리터럴 직접 삽입을 금지한다.

---

## 2. 의존성 / 레이어 원칙

### 2-1. 프론트엔드 레이어

의존 방향은 위에서 아래로만 허용된다. 하위 계층이 상위 계층을 import하는 것을 금지한다.

```
Pages / Views
    ↓
Feature Components
    ↓
Shared UI Components
    ↓
Hooks (useXxx)
    ↓
API Client (TanStack Query + fetch)
    ↓
Types / Constants
```

각 계층의 책임:

- **Pages / Views**: 라우트와 1:1로 대응하는 최상위 컴포넌트. 레이아웃 조합과 데이터 페칭 훅 호출을 담당한다.
- **Feature Components**: 특정 도메인(auth, todos, categories, settings)에 속하는 컴포넌트. 해당 도메인의 훅과 UI 컴포넌트를 조합한다.
- **Shared UI Components**: 도메인에 무관한 재사용 UI 요소(Button, Modal, Input 등). 비즈니스 로직을 포함하지 않는다.
- **Hooks (useXxx)**: TanStack Query를 감싸는 데이터 페칭 훅과 Zustand 상태를 구독하는 커스텀 훅. API 호출 결과를 컴포넌트에 전달한다.
- **API Client**: `fetch` 기반 요청 함수. TanStack Query의 `queryFn` / `mutationFn`으로 사용된다. 인증 헤더 주입, 응답 파싱을 담당한다.
- **Types / Constants**: TypeScript 타입 정의, 공통 상수, 번역 키 상수 등. 어떤 계층도 import할 수 있지만 다른 계층을 import하지 않는다.

### 2-2. 백엔드 레이어

의존 방향은 위에서 아래로만 허용된다.

```
Routes (Express Router)
    ↓
Controllers (요청/응답 처리)
    ↓
Services (비즈니스 로직, 상태 계산 포함)
    ↓
Repository (DB 쿼리, pg 직접 사용)
    ↓
DB (PostgreSQL)
```

각 계층의 책임과 제약:

- **Routes**: URL 패턴과 HTTP 메서드를 Controller 함수에 연결한다. 인증 미들웨어, 유효성 검사 미들웨어를 여기서 적용한다.
- **Controllers**: `req`, `res` 객체를 다루는 유일한 계층이다. Service를 호출하고 반환값을 HTTP 응답으로 변환한다. DB를 직접 참조하지 않는다.
- **Services**: 비즈니스 로직과 도메인 규칙을 구현한다. 할 일 상태 계산(`NOT_STARTED` / `IN_PROGRESS` / `OVERDUE`)은 이 계층에서만 수행한다. HTTP 관련 코드(`req`, `res`)를 포함하지 않는다.
- **Repository**: pg 라이브러리를 사용하여 parameterized query로 DB에 직접 접근한다. 비즈니스 로직을 포함하지 않는다. 단순 CRUD와 조회 쿼리만 담는다.

추가 제약:

- Controller는 Repository를 직접 import하지 않는다.
- Repository는 다른 Repository를 import하지 않는다. 복수 테이블 조작이 필요한 경우 Service가 여러 Repository를 순서대로 호출한다.
- 순환 의존성은 어떤 계층 간에도 허용하지 않는다.

---

## 3. 코드 / 네이밍 원칙

### 3-1. 파일 네이밍

**프론트엔드**

| 파일 종류 | 컨벤션                            | 예시                                |
| --------- | --------------------------------- | ----------------------------------- |
| 컴포넌트  | PascalCase, `.tsx`                | `TodoItem.tsx`, `CategoryList.tsx`  |
| 훅        | camelCase, `use` 접두사, `.ts`    | `useTodos.ts`, `useAuth.ts`         |
| 유틸      | camelCase, `.ts`                  | `dateUtils.ts`, `statusUtils.ts`    |
| 타입 정의 | camelCase, `.ts`                  | `todoTypes.ts`, `authTypes.ts`      |
| 페이지    | PascalCase, `Page` 접미사, `.tsx` | `TodoListPage.tsx`, `LoginPage.tsx` |

**백엔드**

| 파일 종류  | 컨벤션                          | 예시                                     |
| ---------- | ------------------------------- | ---------------------------------------- |
| 라우터     | camelCase + `Routes` 접미사     | `todoRoutes.js`, `authRoutes.js`         |
| 컨트롤러   | camelCase + `Controller` 접미사 | `todoController.js`, `authController.js` |
| 서비스     | camelCase + `Service` 접미사    | `todoService.js`, `categoryService.js`   |
| 레포지토리 | camelCase + `Repository` 접미사 | `todoRepository.js`, `userRepository.js` |
| 유틸       | camelCase, 역할 명시            | `statusCalculator.js`, `jwtUtils.js`     |

### 3-2. 함수 / 변수 네이밍

| 종류                       | 컨벤션                                  | 예시                                 |
| -------------------------- | --------------------------------------- | ------------------------------------ |
| Boolean 변수/Props         | `is`, `has`, `can` 접두사               | `isLoading`, `hasError`, `canDelete` |
| 이벤트 핸들러 (프론트엔드) | `handle` 접두사                         | `handleSubmit`, `handleDelete`       |
| 비동기 함수                | `async/await` 통일, Promise 체인 미사용 | `async function getTodos()`          |
| 상수                       | UPPER_SNAKE_CASE                        | `MAX_TITLE_LENGTH`, `JWT_EXPIRES_IN` |
| 일반 변수/함수             | camelCase                               | `todoList`, `calculateStatus`        |

### 3-3. 컴포넌트 원칙 (프론트엔드)

- 컴포넌트 하나당 파일 하나를 유지한다.
- Props 인터페이스는 컴포넌트 파일 최상단, import 블록 바로 아래에 정의한다.
- 컴포넌트는 `default export`를 사용한다.
- 유틸 함수, 훅, 타입은 `named export`를 사용한다.
- i18n: 사용자에게 보이는 모든 텍스트는 `useTranslation` 훅을 통해 `t('key')` 형태로 참조한다. 번역 키는 `public/locales/` 디렉토리의 JSON 파일에서 관리한다.

```tsx
// 올바른 예시
import { useTranslation } from "react-i18next";

interface TodoItemProps {
  id: string;
  title: string;
  status: TodoStatus;
}

export default function TodoItem({ id, title, status }: TodoItemProps) {
  const { t } = useTranslation();
  return <span>{t("todo.status.inProgress")}</span>;
}
```

### 3-4. API 응답 형식 (백엔드)

모든 API 응답은 아래 형식을 따른다.

**성공 응답**

```json
{ "data": { ... } }
```

**오류 응답**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사람이 읽을 수 있는 오류 설명"
  }
}
```

**HTTP 상태 코드 기준**

| 코드 | 사용 시점                                   |
| ---- | ------------------------------------------- |
| 200  | 조회 / 수정 성공                            |
| 201  | 생성 성공                                   |
| 400  | 요청 유효성 오류 (입력값 검증 실패)         |
| 401  | 미인증 (토큰 없음, 만료, 위조, 탈퇴 사용자) |
| 403  | 권한 없음 (타인 리소스 접근 시도)           |
| 404  | 리소스 없음                                 |
| 409  | 충돌 (중복 이메일, 중복 카테고리명 등)      |
| 500  | 서버 내부 오류                              |

**오류 코드 목록 (error.code 값)**

프론트엔드는 이 코드를 기준으로 오류 유형별 분기 처리를 구현한다.

| code                         | HTTP | 발생 상황                                         |
| ---------------------------- | ---- | ------------------------------------------------- |
| `AUTH_INVALID_CREDENTIALS`   | 401  | 이메일 또는 비밀번호 불일치 (AC-02-02)            |
| `AUTH_TOKEN_MISSING`         | 401  | Authorization 헤더 없음                           |
| `AUTH_TOKEN_EXPIRED`         | 401  | Access Token 만료 (24h 초과)                      |
| `AUTH_TOKEN_INVALID`         | 401  | 토큰 서명 위조 또는 형식 오류                     |
| `AUTH_USER_DELETED`          | 401  | 탈퇴 사용자의 토큰으로 접근 (AC-13-03)            |
| `AUTH_EMAIL_DUPLICATE`       | 409  | 이미 존재하는 이메일로 회원가입 시도 (AC-01-02)   |
| `AUTH_PASSWORD_WEAK`         | 400  | 비밀번호 규칙 미달 (AC-01-03, R-AUTH-06)          |
| `AUTH_PASSWORD_MISMATCH`     | 401  | 현재 비밀번호 불일치 (AC-03-05)                   |
| `FORBIDDEN`                  | 403  | 타인 리소스 접근 시도 (AC-05-03, AC-06-03)        |
| `NOT_FOUND`                  | 404  | 요청한 리소스가 존재하지 않음                     |
| `TODO_TITLE_REQUIRED`        | 400  | 제목 누락 (R-TODO-01)                             |
| `TODO_TITLE_TOO_LONG`        | 400  | 제목 100자 초과 (AC-04-05)                        |
| `TODO_DESC_TOO_LONG`         | 400  | 설명 1000자 초과 (AC-04-06)                       |
| `TODO_DATE_INVALID`          | 400  | 종료일이 시작일보다 이전 (AC-04-04, R-TODO-02)    |
| `CATEGORY_NAME_DUPLICATE`    | 409  | 중복 카테고리명 (대소문자 무구분, AC-10-02)       |
| `CATEGORY_NAME_TOO_LONG`     | 400  | 카테고리명 30자 초과 (AC-10-03)                   |
| `CATEGORY_DEFAULT_IMMUTABLE` | 400  | 기본 카테고리 수정/삭제 시도 (AC-11-02, AC-12-02) |
| `VALIDATION_ERROR`           | 400  | 기타 입력값 유효성 오류                           |
| `INTERNAL_SERVER_ERROR`      | 500  | 서버 내부 오류                                    |

**목록 API 응답 페이로드 예시**

```json
// GET /todos 성공 응답
{
  "data": [
    {
      "id": "uuid",
      "title": "데이터베이스 기말 프로젝트 제출",
      "description": "ERD 설계 + 쿼리 작성",
      "status": "IN_PROGRESS",
      "startDate": "2026-05-28",
      "endDate": "2026-06-10",
      "category": { "id": "uuid", "name": "데이터베이스" },
      "createdAt": "2026-05-27T09:00:00Z"
    }
  ]
}

// 단일 리소스 생성 성공 응답 (201)
{ "data": { "id": "uuid", ... } }

// 오류 응답 예시
{ "error": { "code": "TODO_DATE_INVALID", "message": "종료일은 시작일 이후여야 합니다." } }
```

---

## 4. 테스트 / 품질 원칙

### 4-1. 테스트 범위

- **Service 레이어 단위 테스트**: 비즈니스 로직이 집중된 Service는 단위 테스트 필수. 커버리지 목표 80% 이상.
- **Repository 레이어 통합 테스트**: 실제 테스트 DB에 대한 쿼리 실행 결과를 검증하는 통합 테스트를 권장한다.
- **E2E 테스트**: `docs/3-user-scenarios.md`의 Happy Path(US-01, US-02, US-05, US-09, US-13 등)를 기준으로 E2E 케이스를 작성한다.

### 4-2. 날짜 의존 테스트

상태 계산(`statusCalculator.js`)처럼 현재 날짜에 의존하는 함수는 반드시 날짜를 인자(`today`)로 받도록 설계한다. 테스트 시 고정 날짜를 주입하여 결과가 실행 시점과 무관하게 결정론적으로 동작하게 한다.

```javascript
// 올바른 설계 — 날짜를 인자로 받는다
function calculateStatus(todo, today) {
  if (todo.status === "DONE") return "DONE";
  if (!todo.end_date && !todo.start_date) return "NOT_STARTED";
  // ...
}

// 테스트에서 날짜 고정 주입
calculateStatus(todo, new Date("2026-05-27"));
```

### 4-3. 커버리지 목표

| 계층              | 커버리지 목표                                      |
| ----------------- | -------------------------------------------------- |
| Service 레이어    | 80% 이상 (필수)                                    |
| Repository 레이어 | 통합 테스트 권장 (커버리지 목표 없음)              |
| Controller 레이어 | 주요 분기점(인증 실패, 권한 오류) 단위 테스트 권장 |

### 4-4. 린트 / 포맷

- ESLint + Prettier 공통 설정을 프론트엔드와 백엔드 각각의 루트에 배치한다.
- CI 파이프라인에서 린트 통과를 필수 조건으로 설정한다.
- 프론트엔드: TypeScript strict 모드에서 컴파일 오류 없음이 CI 통과 조건이다.

### 4-5. PR 원칙

- 하나의 PR은 하나의 기능 또는 하나의 버그 수정만 포함한다.
- 작업과 무관한 리팩토링, 포맷 수정, 주석 정리를 동일 PR에 포함하지 않는다.

---

## 5. 설정 / 보안 / 운영 원칙

### 5-1. 환경 변수 관리

민감 정보는 반드시 환경 변수로 관리한다. `.env` 파일은 `.gitignore`에 포함하고, `.env.example` 파일을 저장소에 커밋하여 팀원이 필요한 변수를 파악할 수 있게 한다.

**환경 변수 목록 (`.env.example` 기준)**

| 변수명               | 필수 여부 | 기본값                  | 설명                                                                          |
| -------------------- | --------- | ----------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`       | 필수      | —                       | PostgreSQL 연결 문자열 (예: `postgresql://user:pass@localhost:5432/todolist`) |
| `JWT_SECRET`         | 필수      | —                       | JWT 서명 비밀 키 (32자 이상 랜덤 문자열 권장)                                 |
| `PORT`               | 선택      | `3000`                  | Express 서버 포트                                                             |
| `NODE_ENV`           | 필수      | `development`           | 실행 환경 (`development` / `production` / `test`)                             |
| `BCRYPT_SALT_ROUNDS` | 선택      | `10`                    | bcrypt 해싱 강도 (10 이상)                                                    |
| `CORS_ORIGIN`        | 선택      | `http://localhost:5173` | 허용 CORS 출처 (프로덕션 시 필수)                                             |

**`.env.example` 파일 내용**

```dotenv
# =============================================
# TodoList Backend — 환경 변수 예시
# 이 파일을 복사해 .env 로 저장한 뒤 실제 값을 채운다.
# .env 파일은 절대 커밋하지 않는다 (.gitignore 포함).
# =============================================

# [필수] PostgreSQL 연결 문자열
# 형식: postgresql://<user>:<password>@<host>:<port>/<database>
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/todolist

# [필수] JWT 서명 비밀 키 — 프로덕션에서는 32자 이상 랜덤 문자열로 교체한다.
# 생성 예시: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=change_this_to_a_random_32char_secret_key

# [선택] Express 서버 리슨 포트 (기본값: 3000)
PORT=3000

# [필수] 실행 환경 — development | production | test
NODE_ENV=development

# [선택] bcrypt 해싱 강도 (기본값: 10, 최솟값: 10)
BCRYPT_SALT_ROUNDS=10

# [선택] 허용 CORS 출처 — 프로덕션에서는 실제 도메인으로 교체한다.
CORS_ORIGIN=http://localhost:5173
```

> **주의**: `JWT_SECRET` 기본값은 개발 전용이다. 프로덕션 배포 전 반드시 충분한 엔트로피의 랜덤 값으로 교체한다.

앱 시작 시 `src/config/env.js`가 필수 변수의 존재를 검증하고, 누락된 경우 즉시 프로세스를 종료한다.

---

**프론트엔드 환경 변수 목록 (`frontend/.env.example` 기준)**

Vite는 `VITE_` 접두사가 있는 변수만 클라이언트 번들에 노출한다. 민감 정보(토큰, 비밀 키)를 `VITE_` 변수에 절대 넣지 않는다.

| 변수명              | 필수 여부 | 기본값                  | 설명                                           |
| ------------------- | --------- | ----------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL` | 필수      | `http://localhost:3000` | 백엔드 API 서버 URL (Express 서버 포트와 일치) |

**`frontend/.env.example` 파일 내용**

```dotenv
# =============================================
# TodoList Frontend — 환경 변수 예시
# Vite는 VITE_ 접두사가 있는 변수만 클라이언트 코드에 노출한다.
# 민감 정보(비밀 키, DB 연결 등)를 이 파일에 포함하지 않는다.
# =============================================

# [필수] 백엔드 Express 서버 URL — 개발 환경에서는 포트 3000을 사용한다.
# 프로덕션에서는 실제 API 도메인으로 교체한다.
VITE_API_BASE_URL=http://localhost:3000
```

> **포트 관계 정리**: 백엔드 Express 서버 → `PORT=3000`, 프론트엔드 Vite 개발 서버 → 기본 포트 `5173` (Vite 기본값, `vite.config.ts`의 `server.port`로 변경 가능). `VITE_API_BASE_URL`은 백엔드 포트(3000)를 가리킨다.

### 5-2. JWT 보안

- Access Token 만료 시간: 24시간.
- Refresh Token: 미사용.
- 로그아웃 시 클라이언트 측 토큰만 삭제한다(서버 블랙리스트 없음). 단, 회원 탈퇴 시에는 서버가 해당 `user_id`의 이후 요청을 거부한다 (AC-13-03).
- 탈퇴 사용자 처리: `users` 테이블에서 레코드 삭제 후 해당 `user_id`로 조회 시 404 또는 401을 반환하므로, 기존 토큰을 이용한 API 접근이 자연스럽게 차단된다.

### 5-3. CORS

- 개발 환경(`NODE_ENV=development`): `http://localhost:*`만 허용.
- 프로덕션 환경: 허용 출처(origin)를 환경 변수로 명시적으로 지정한다. `*` 와일드카드 허용 금지.

### 5-4. SQL Injection 방지

pg 라이브러리의 parameterized query (`$1`, `$2`, ...) 사용을 필수로 한다. 문자열 템플릿 또는 문자열 연결로 쿼리를 조립하는 것을 금지한다.

```javascript
// 금지
const query = `SELECT * FROM todos WHERE user_id = '${userId}'`;

// 필수
const query = "SELECT * FROM todos WHERE user_id = $1";
const result = await pool.query(query, [userId]);
```

### 5-5. 비밀번호 보안

- 비밀번호는 bcrypt로 해싱하여 저장한다 (salt rounds 10 이상).
- 평문 비밀번호를 DB에 저장하거나 로그에 기록하는 것을 금지한다.
- 비밀번호 관련 로직은 `passwordUtils.js`에만 위치한다.

### 5-6. 에러 핸들링

- 서버 내부 오류의 stack trace 및 구현 세부 정보를 클라이언트에 노출하지 않는다.
- `NODE_ENV=development`인 경우에 한해 응답에 stack trace를 포함할 수 있다.
- 전역 에러 핸들러(`errorHandler.js`)에서 모든 미처리 에러를 500 응답으로 통일한다.

### 5-7. 로깅

- 요청 / 응답 로그에 비밀번호, JWT 토큰 등 민감 정보를 포함하지 않는다.
- `Authorization` 헤더는 로그에서 마스킹하거나 제외한다.

### 5-8. Rate Limiting (향후 고려)

현재 구현 범위(1인 5일)에서는 미적용이나, 프로덕션 배포 전 아래 항목을 검토한다.

- 로그인 엔드포인트(`POST /auth/login`)에 IP 기반 요청 횟수 제한을 적용하여 브루트포스 공격을 방지한다.
- Node.js 생태계에서는 `express-rate-limit` 패키지를 사용하여 간단히 구현할 수 있다.

### 5-9. HTTPS (프로덕션 필수)

- Express 서버는 HTTP만 제공한다. HTTPS는 앞단의 리버스 프록시(Nginx, Caddy 등)에서 처리한다.
- 프로덕션 환경에서 HTTP → HTTPS 리다이렉트를 리버스 프록시 레벨에서 강제한다.
- 개발 환경에서는 `http://localhost:3000` 사용이 허용된다.

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/
│   └── locales/           # i18n 번역 파일
│       ├── ko/
│       │   └── translation.json
│       └── en/
│           └── translation.json
├── src/
│   ├── assets/            # 이미지, 폰트 등 정적 파일
│   ├── components/        # 공유 UI 컴포넌트 (버튼, 모달 등)
│   │   └── ui/
│   ├── features/          # 도메인별 기능 모듈
│   │   ├── auth/          # 인증 (로그인, 회원가입, 프로필)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api/
│   │   ├── todos/         # 할 일 관리
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api/
│   │   ├── categories/    # 카테고리 관리
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api/
│   │   └── settings/      # 설정 (테마, 언어)
│   │       ├── components/
│   │       ├── hooks/
│   │       └── api/
│   ├── hooks/             # 전역 공유 훅
│   ├── lib/               # 외부 라이브러리 초기화 (i18n, queryClient 등)
│   ├── pages/             # 라우트별 페이지 컴포넌트
│   ├── store/             # Zustand 전역 상태 (인증 토큰, 테마 등)
│   ├── types/             # 전역 TypeScript 타입 정의 (공유 타입만)
│   ├── constants/         # 전역 상수 (TodoStatus, API 경로 등)
│   ├── utils/             # 순수 유틸 함수 (날짜 계산, 언어 파싱 등)
│   ├── router.tsx         # React Router 라우트 정의 + PrivateRoute
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

**디렉토리별 역할**

| 디렉토리             | 역할                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `public/locales/`    | react-i18next가 읽는 번역 JSON 파일. 언어별(ko, en) 서브디렉토리로 분리한다.                                                                                                                                                               |
| `src/assets/`        | 이미지, SVG, 폰트 등 정적 자원. 코드에서 직접 import하여 사용한다.                                                                                                                                                                         |
| `src/components/ui/` | 도메인 무관 재사용 컴포넌트(Button, Input, Modal, Badge 등). Props 인터페이스 외 비즈니스 로직 없음.                                                                                                                                       |
| `src/features/`      | 도메인별 독립 모듈. 각 feature 내부의 `components/`, `hooks/`, `api/`는 해당 도메인에만 관련된 코드를 포함한다. feature 간 직접 import를 최소화하고, 공유 필요 시 `src/components/`, `src/hooks/`, `src/types/`로 이동한다.                |
| `src/hooks/`         | 여러 feature에서 공통으로 사용하는 전역 커스텀 훅(예: `useCurrentUser`, `useTheme`).                                                                                                                                                       |
| `src/lib/`           | TanStack Query의 `QueryClient` 인스턴스 생성, react-i18next 초기화 등 외부 라이브러리 설정 코드.                                                                                                                                           |
| `src/pages/`         | 라우트와 1:1 대응하는 페이지 컴포넌트. 레이아웃과 feature component 조합만 담당하며 직접적인 API 호출 로직을 최소화한다.                                                                                                                   |
| `src/store/`         | Zustand store 정의. 인증 토큰, 현재 사용자 정보, 테마 설정 등 전역 클라이언트 상태를 관리한다. 서버 데이터(할 일 목록 등)는 TanStack Query가 담당하므로 store에 포함하지 않는다.                                                           |
| `src/types/`         | 여러 계층에서 공유하는 TypeScript 타입과 인터페이스 정의(예: `Todo`, `Category`, `User`, `TodoStatus`).                                                                                                                                    |
| `src/utils/`         | 순수 함수 모음. 외부 의존성 없이 입력을 받아 결과를 반환한다. 날짜 포맷, 브라우저 언어 파싱(R-SET-05) 등이 여기에 위치한다.                                                                                                                |
| `src/constants/`     | 앱 전역에서 사용하는 상수 모음. 할 일 상태 값(`TODO_STATUS`), 번역 키 네임스페이스, API 경로 접두사 등을 정의한다. 백엔드와 값이 일치해야 하는 상태 코드는 이 파일을 단일 출처로 사용한다.                                                 |
| `src/router.tsx`     | React Router 라우트 정의 파일. `App.tsx`에서 `BrowserRouter`로 감싸고, 인증이 필요한 라우트는 `PrivateRoute` 컴포넌트(`src/components/PrivateRoute.tsx`)로 래핑한다. 비인증 상태에서 보호된 라우트 접근 시 로그인 페이지로 리다이렉트한다. |

**`PrivateRoute` 구현 패턴**

`src/store/`의 Zustand auth store에서 토큰 유무를 확인한다. 토큰이 없으면 `<Navigate>`로 로그인 페이지에 리다이렉트한다.

```tsx
// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function PrivateRoute() {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// src/router.tsx 사용 예시
<Route element={<PrivateRoute />}>
  <Route path="/todos" element={<TodoListPage />} />
  <Route path="/settings" element={<SettingsPage />} />
</Route>
```

**타입 파일 위치 기준**

- 여러 feature에서 공유하는 타입(예: `Todo`, `Category`, `User`, `TodoStatus`)은 `src/types/`에 위치한다.
- 특정 feature 내부에서만 사용하는 Props 타입·로컬 인터페이스는 해당 feature의 컴포넌트 파일 상단에 인라인으로 정의하거나 `features/{domain}/types.ts`에 위치시킨다.
- `src/types/`와 `features/*/types.ts` 간 중복 정의를 금지한다. 공유 필요가 생기면 `src/types/`로 이동한다.

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── config/            # DB 연결, 환경 변수 로드
│   │   ├── db.js          # pg Pool 설정
│   │   └── env.js         # 환경 변수 유효성 검사 및 export
│   ├── middleware/        # Express 미들웨어
│   │   ├── auth.js        # JWT 검증 미들웨어
│   │   ├── errorHandler.js# 전역 에러 핸들러
│   │   └── validate.js    # 요청 유효성 검사 미들웨어
│   ├── routes/            # Express 라우터 (URL 매핑)
│   │   ├── authRoutes.js
│   │   ├── todoRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── userRoutes.js
│   ├── controllers/       # 요청/응답 처리 (HTTP 레이어)
│   │   ├── authController.js
│   │   ├── todoController.js
│   │   ├── categoryController.js
│   │   └── userController.js
│   ├── services/          # 비즈니스 로직 (상태 계산 포함)
│   │   ├── authService.js
│   │   ├── todoService.js
│   │   ├── categoryService.js
│   │   └── userService.js
│   ├── repositories/      # DB 쿼리 (pg 직접 사용)
│   │   ├── todoRepository.js
│   │   ├── categoryRepository.js
│   │   └── userRepository.js
│   ├── utils/             # 순수 유틸 함수
│   │   ├── statusCalculator.js  # 할 일 상태 계산 (날짜 인자 주입 방식)
│   │   ├── passwordUtils.js     # bcrypt 해싱/검증
│   │   └── jwtUtils.js          # JWT 생성/검증
│   └── app.js             # Express 앱 초기화
├── tests/
│   ├── unit/              # 서비스 레이어 단위 테스트
│   └── integration/       # Repository 통합 테스트
├── .env.example
├── .gitignore
└── package.json
```

**디렉토리 및 핵심 파일 역할**

| 경로                             | 역할                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/db.js`               | pg `Pool` 인스턴스를 생성하고 export한다. 연결 설정(host, port, database, user, password)은 `env.js`에서 읽는다.                                                                                                                                                                                                                              |
| `src/config/env.js`              | 앱 시작 시 필수 환경 변수(`DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`)의 존재를 검증하고, 검증된 값을 export한다. 환경 변수 누락 시 즉시 프로세스를 종료한다.                                                                                                                                                                            |
| `src/middleware/auth.js`         | 요청 헤더의 JWT를 검증하는 미들웨어. 유효한 토큰이면 `req.user`에 `userId`를 주입한다. 토큰 없거나 만료 시 401 반환.                                                                                                                                                                                                                          |
| `src/middleware/errorHandler.js` | Express 전역 에러 핸들러. 모든 미처리 오류를 받아 표준 오류 응답 형식(`{ error: { code, message } }`)으로 변환한다. `NODE_ENV=production`에서는 stack trace를 제외한다.                                                                                                                                                                       |
| `src/middleware/validate.js`     | 라우터에서 사용하는 요청 유효성 검사 미들웨어 팩토리. 스키마를 인자로 받아 `req.body` / `req.params`를 검증하고, 실패 시 400 응답을 반환한다.                                                                                                                                                                                                 |
| `src/routes/`                    | URL과 HTTP 메서드를 Controller 함수에 연결한다. 인증이 필요한 라우트에는 `auth.js` 미들웨어를, 입력 검증이 필요한 라우트에는 `validate.js` 미들웨어를 체인으로 적용한다. 인증 불필요 라우트(회원가입, 로그인)는 주석으로 명시한다. **파일 경계**: `authRoutes.js` — 인증 불필요 라우트 (`POST /auth/signup`, `POST /auth/login`). `userRoutes.js` — 인증 필요 라우트 (`GET /users/me`, `PATCH /users/me/password`, `PATCH /users/me/settings`, `DELETE /users/me`).                                                                  |
| `src/controllers/`               | `req` / `res`를 다루는 유일한 계층. Service 함수를 호출하고 반환값을 HTTP 상태 코드와 함께 응답으로 변환한다. 비즈니스 로직과 DB 쿼리를 포함하지 않는다.                                                                                                                                                                                      |
| `src/services/`                  | 도메인 규칙과 비즈니스 로직을 구현한다. 카테고리 삭제 시 할 일을 기본 카테고리로 이동하는 로직(R-CAT-04), 회원 탈퇴 시 cascade delete 순서 제어(R-AUTH-05), 할 일 상태 계산 결과를 목록에 병합하는 로직 등이 이 계층에 위치한다.                                                                                                              |
| `src/repositories/`              | pg Pool을 사용하여 parameterized query로 PostgreSQL에 접근한다. 순수한 CRUD 및 조회 쿼리만 포함한다. 비즈니스 규칙 판단 없이 데이터 접근 결과를 그대로 반환한다.                                                                                                                                                                              |
| `src/utils/statusCalculator.js`  | **별도 강조**: 할 일의 `status` 필드와 날짜 정보를 받아 `NOT_STARTED` / `IN_PROGRESS` / `OVERDUE` / `DONE` 중 하나를 반환하는 순수 함수. 현재 날짜를 전역에서 읽지 않고 인자 `today`로 받는다. 이를 통해 테스트 시 날짜를 고정값으로 주입할 수 있어 결정론적인 단위 테스트가 가능하다. (`docs/3-user-scenarios.md` 테스트 환경 주의사항 참조) |
| `src/utils/passwordUtils.js`     | bcrypt 기반 비밀번호 해싱(`hashPassword`) 및 검증(`verifyPassword`) 함수. 비밀번호 관련 로직의 단일 출처.                                                                                                                                                                                                                                     |
| `src/utils/jwtUtils.js`          | JWT 생성(`signToken`) 및 검증(`verifyToken`) 함수. `JWT_SECRET`과 만료 시간(24시간)을 이 파일에서만 참조한다.                                                                                                                                                                                                                                 |
| `src/app.js`                     | Express 앱 인스턴스를 생성하고 미들웨어(CORS, JSON 파서, 라우터, 전역 에러 핸들러)를 등록한다.                                                                                                                                                                                                                                                |
| `tests/unit/`                    | Service 레이어 함수의 단위 테스트. DB 연결 없이 Repository를 mock 처리하여 순수 비즈니스 로직만 검증한다.                                                                                                                                                                                                                                     |
| `tests/integration/`             | 실제 테스트 DB에 연결하여 Repository의 쿼리 결과를 검증한다. 각 테스트는 독립적으로 실행 가능하도록 데이터를 사전에 삽입하고 종료 후 정리한다.                                                                                                                                                                                                |

---

## 8. DB 마이그레이션 전략

Prisma 미사용 조건에서 스키마 변경은 수동 SQL 파일로 관리한다.

### 8-1. 디렉토리 구조

```
backend/
└── migrations/
    ├── 001_init.sql          # 초기 테이블 생성 (users, categories, todos)
    ├── 002_add_theme.sql     # 예시: User 테이블에 theme 컬럼 추가
    └── 003_add_language.sql  # 예시: User 테이블에 language 컬럼 추가
```

### 8-2. 네이밍 규칙

- 파일명: `{순번(3자리)}_{변경_내용}.sql` 형식 (예: `001_init.sql`, `002_add_theme.sql`)
- 순번은 실행 순서를 보장하며, 한 번 커밋된 파일은 수정하지 않는다.
- 스키마를 수정할 경우 반드시 새 파일을 추가한다.

### 8-3. 실행 방법

`package.json`에 아래 스크립트를 정의하여 수동 실행한다.

```json
{
  "scripts": {
    "db:migrate": "psql $DATABASE_URL -f migrations/001_init.sql",
    "db:migrate:all": "node scripts/migrate.js"
  }
}
```

`db:migrate:all`은 bash glob 문법 대신 Node.js 스크립트를 사용하여 Windows / macOS / Linux 모두에서 동작한다.

```javascript
// backend/scripts/migrate.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'migrations');
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  console.log(`Running: ${file}`);
  execSync(`psql ${process.env.DATABASE_URL} -f "${filePath}"`, { stdio: 'inherit' });
}
```

또는 단일 파일을 psql로 직접 실행한다.

```bash
psql $DATABASE_URL -f migrations/001_init.sql
```

### 8-4. 적용 원칙

- 마이그레이션 파일은 멱등성(idempotent)을 보장한다: `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` 사용.
- 테스트 환경(`NODE_ENV=test`)은 별도 DB(`todolist_test`)를 사용하며, 테스트 실행 전 초기화 스크립트(`001_init.sql`)를 실행한다.
- 롤백 스크립트(`_rollback.sql`)는 선택 사항이나, 프로덕션 배포 전 준비를 권장한다.

### 8-5. 기본 카테고리 Seed 전략

`docs/1-domain-definition.md` R-CAT-01에 따라 회원 가입 시 "기타" 카테고리가 자동 생성된다.

- **생성 시점**: `authService.js`의 회원가입 로직 내에서 사용자 INSERT 직후 `categoryRepository.js`를 호출하여 기본 카테고리를 INSERT한다.
- **트랜잭션**: 사용자 INSERT와 기본 카테고리 INSERT는 단일 트랜잭션으로 묶는다. 둘 중 하나라도 실패하면 전체를 롤백하여 고아 데이터 발생을 방지한다.
- **식별**: `categories` 테이블에 `is_default BOOLEAN NOT NULL DEFAULT FALSE` 컬럼을 두어 기본 카테고리를 구분한다. 기본 카테고리는 수정·삭제 불가 (`CATEGORY_DEFAULT_IMMUTABLE`).
- **별도 seed 파일 불필요**: DB 초기화 시 자동 삽입하는 방식 대신, 가입 시점에 각 사용자별로 생성하므로 별도 SQL seed 파일은 필요 없다.

---

## 변경 이력

| 버전 | 날짜       | 변경 내용                                                                                                                                                                 |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0  | 2026-05-27 | 최초 작성 (7개 섹션, 436줄)                                                                                                                                               |
| 1.1  | 2026-05-27 | OVERDUE 계산 시점 정책 명시(1-9), 오류 코드 목록 및 API 응답 예시 추가(3-4), 환경 변수 목록 보강(5-1), DB 마이그레이션 전략 섹션 신설(8), 프론트 constants·router 추가(6) |
| 1.2  | 2026-05-27 | 프론트엔드 환경 변수 및 .env.example 추가(5-1), todos.status 컬럼 처리 명확화(1-9), PrivateRoute 구현 패턴 추가(6), authRoutes·userRoutes 경계 명시(7), db:migrate:all Windows 호환 수정(8-3), 기본 카테고리 seed 전략 추가(8-5), Rate Limiting·HTTPS 보안 항목 추가(5-8·5-9) |
