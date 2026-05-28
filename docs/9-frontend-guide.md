# 프론트엔드 통합 가이드

**버전**: 1.0  
**작성일**: 2026-05-28  
**참조**: docs/2-PRD.md (v2.2), docs/7-execution-plan.md (v1.2), docs/8-wireframes.md (v1.3)

---

## 목차

1. [API 개요](#1-api-개요)
2. [인증 흐름](#2-인증-흐름)
3. [공통 응답 형식](#3-공통-응답-형식)
4. [에러 코드 목록](#4-에러-코드-목록)
5. [엔드포인트 상세](#5-엔드포인트-상세)
6. [할 일 상태 계산 규칙](#6-할-일-상태-계산-규칙)
7. [프론트엔드 구현 패턴](#7-프론트엔드-구현-패턴)
8. [화면별 연동 가이드](#8-화면별-연동-가이드)
9. [TypeScript 타입 정의](#9-typescript-타입-정의)

---

## 1. API 개요

| 항목 | 값 |
|------|----|
| Base URL (개발) | `http://localhost:3000` |
| Base URL (환경변수) | `VITE_API_BASE_URL` |
| Content-Type | `application/json` |
| 인증 방식 | JWT Bearer Token |
| 토큰 유효시간 | 24시간 |
| API 문서 (Swagger UI) | `http://localhost:3000/api-docs` |

---

## 2. 인증 흐름

### 토큰 획득

```
POST /auth/login → accessToken 발급 → Zustand store + localStorage 저장
```

### 인증이 필요한 요청

모든 보호된 엔드포인트는 `Authorization` 헤더가 필수입니다.

```
Authorization: Bearer {accessToken}
```

### 토큰 만료 처리

API가 `401`을 반환하면 클라이언트가 즉시 로그아웃 처리해야 합니다.

```
401 응답 수신 → Zustand store clearToken() → /login 리다이렉트
```

> 서버는 Refresh Token을 지원하지 않습니다. 토큰 만료 시 재로그인이 유일한 방법입니다.

### 로그아웃

서버 요청 없이 클라이언트에서 토큰만 삭제하면 됩니다.

```typescript
// store/authStore.ts
clearToken() → localStorage 제거 → /login 리다이렉트
```

---

## 3. 공통 응답 형식

### 성공 응답

```json
{
  "data": { ... }
}
```

### 에러 응답

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사람이 읽을 수 있는 오류 메시지"
  }
}
```

> 개발 환경(`NODE_ENV=development`)에서는 `error.stack`이 추가로 포함됩니다.

---

## 4. 에러 코드 목록

### 인증 관련

| HTTP | 코드 | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 이메일 형식 오류, 이름 길이 오류 등 일반 검증 실패 |
| 400 | `AUTH_PASSWORD_WEAK` | 비밀번호가 8~128자 + 영문+숫자 규칙 미충족 |
| 401 | `AUTH_REQUIRED` | Authorization 헤더 없음 |
| 401 | `AUTH_TOKEN_EXPIRED` | JWT 만료 |
| 401 | `AUTH_TOKEN_INVALID` | JWT 위조/손상 |
| 401 | `AUTH_INVALID_CREDENTIALS` | 이메일 또는 비밀번호 불일치 |
| 401 | `AUTH_PASSWORD_MISMATCH` | 프로필 수정 시 현재 비밀번호 불일치 |
| 401 | `AUTH_USER_DELETED` | 탈퇴한 계정의 토큰으로 요청 |
| 409 | `AUTH_EMAIL_DUPLICATE` | 이미 가입된 이메일 |

### 카테고리 관련

| HTTP | 코드 | 상황 |
|------|------|------|
| 400 | `CATEGORY_DEFAULT_IMMUTABLE` | 기본 카테고리 수정/삭제 시도 |
| 400 | `CATEGORY_NAME_TOO_LONG` | 카테고리 이름 30자 초과 |
| 403 | `FORBIDDEN` | 타인 카테고리 접근 |
| 404 | `NOT_FOUND` | 존재하지 않는 카테고리 |
| 409 | `CATEGORY_NAME_DUPLICATE` | 동일 사용자 내 중복 카테고리 이름 (대소문자 무시) |

### 할 일 관련

| HTTP | 코드 | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 제목 누락 등 |
| 400 | `TODO_TITLE_TOO_LONG` | 제목 100자 초과 |
| 400 | `TODO_DESC_TOO_LONG` | 설명 1000자 초과 |
| 400 | `TODO_DATE_INVALID` | 종료일이 시작일보다 이전 |
| 403 | `FORBIDDEN` | 타인 할 일 접근 |
| 404 | `TODO_NOT_FOUND` | 존재하지 않는 할 일 |
| 404 | `CATEGORY_NOT_FOUND` | 존재하지 않는 카테고리 ID로 할 일 생성 |

### 공통

| HTTP | 코드 | 상황 |
|------|------|------|
| 404 | `NOT_FOUND` | 존재하지 않는 라우트 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

---

## 5. 엔드포인트 상세

### 5.1 인증 API

#### POST /auth/register — 회원가입

**인증 불필요**

**요청**
```json
{
  "email": "user@example.com",
  "password": "pass1234",
  "name": "홍길동"
}
```

**성공 응답 `201`**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**주요 에러**
- `400 AUTH_PASSWORD_WEAK` — 비밀번호 규칙 미충족 (8~128자, 영문+숫자 각 1자 이상)
- `400 VALIDATION_ERROR` — 이메일 형식 오류, 이름 1~50자 규칙 위반
- `409 AUTH_EMAIL_DUPLICATE` — 이미 가입된 이메일

**사이드 이펙트**: 가입 성공 시 `기본` 카테고리가 자동 생성됩니다.

---

#### POST /auth/login — 로그인

**인증 불필요**

**요청**
```json
{
  "email": "user@example.com",
  "password": "pass1234"
}
```

**성공 응답 `200`**
```json
{
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

**주요 에러**
- `401 AUTH_INVALID_CREDENTIALS` — 이메일 또는 비밀번호 불일치 (이메일 존재 여부 노출 금지)

---

### 5.2 사용자 API

#### GET /users/me — 내 정보 조회

**인증 필요**

**성공 응답 `200`**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "theme": "LIGHT",
    "language": "ko",
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

---

#### PATCH /users/me — 프로필 수정

**인증 필요**

이름 변경 또는 비밀번호 변경 중 하나 이상 포함해야 합니다.

**요청 (이름 변경)**
```json
{
  "name": "새이름"
}
```

**요청 (비밀번호 변경)**
```json
{
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호1"
}
```

**요청 (이름 + 비밀번호 동시)**
```json
{
  "name": "새이름",
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호1"
}
```

**성공 응답 `200`**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "새이름"
  }
}
```

**주요 에러**
- `401 AUTH_PASSWORD_MISMATCH` — 현재 비밀번호 불일치
- `400 AUTH_PASSWORD_WEAK` — 새 비밀번호 규칙 미충족
- `400 VALIDATION_ERROR` — 이름 1~50자 위반, 변경 항목 없음

> 이메일은 변경 불가합니다. 이메일 필드를 요청에 포함해도 무시됩니다.

---

#### PATCH /users/me/settings — 설정 변경

**인증 필요**

`theme` 또는 `language` 중 하나 이상 포함해야 합니다.

**요청**
```json
{
  "theme": "DARK",
  "language": "en"
}
```

허용 값:
- `theme`: `"LIGHT"` | `"DARK"`
- `language`: `"ko"` | `"en"`

**성공 응답 `200`**
```json
{
  "data": {
    "theme": "DARK",
    "language": "en"
  }
}
```

---

#### DELETE /users/me — 회원 탈퇴

**인증 필요**

**성공 응답 `200`**
```json
{
  "data": {}
}
```

**사이드 이펙트**: 사용자의 모든 카테고리와 할 일이 cascade 삭제됩니다 (복구 불가).

---

### 5.3 카테고리 API

#### GET /categories — 카테고리 목록

**인증 필요**

**성공 응답 `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "기본",
      "isDefault": true,
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "업무",
      "isDefault": false,
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z"
    }
  ]
}
```

---

#### POST /categories — 카테고리 생성

**인증 필요**

**요청**
```json
{
  "name": "업무"
}
```

**성공 응답 `201`**
```json
{
  "data": {
    "id": "uuid",
    "name": "업무",
    "isDefault": false,
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

**주요 에러**
- `409 CATEGORY_NAME_DUPLICATE` — 동일 사용자 내 중복 이름 (대소문자 무시)
- `400 CATEGORY_NAME_TOO_LONG` — 30자 초과

---

#### PATCH /categories/:id — 카테고리 수정

**인증 필요**

**요청**
```json
{
  "name": "새 이름"
}
```

**성공 응답 `200`**
```json
{
  "data": {
    "id": "uuid",
    "name": "새 이름",
    "isDefault": false,
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

**주요 에러**
- `400 CATEGORY_DEFAULT_IMMUTABLE` — 기본 카테고리 수정 시도
- `403 FORBIDDEN` — 타인 카테고리

---

#### DELETE /categories/:id — 카테고리 삭제

**인증 필요**

**성공 응답 `200`**
```json
{
  "data": {}
}
```

**주요 에러**
- `400 CATEGORY_DEFAULT_IMMUTABLE` — 기본 카테고리 삭제 시도
- `403 FORBIDDEN` — 타인 카테고리

**사이드 이펙트**: 해당 카테고리의 모든 할 일이 `기본` 카테고리로 이동됩니다 (삭제되지 않음). 카테고리 삭제 후 할 일 목록 캐시를 무효화해야 합니다.

---

### 5.4 할 일 API

#### GET /todos — 할 일 목록

**인증 필요**

**쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | `NOT_STARTED` \| `IN_PROGRESS` \| `OVERDUE` \| `DONE` | 상태 필터 |
| `categoryId` | UUID | 카테고리 필터 |
| `dueDateFrom` | `YYYY-MM-DD` | 종료일 범위 시작 |
| `dueDateTo` | `YYYY-MM-DD` | 종료일 범위 끝 |

- 여러 파라미터 지정 시 AND 조건으로 동작합니다.
- 캘린더 뷰 구현 시: `GET /todos?dueDateFrom=2026-05-01&dueDateTo=2026-05-31`

**성공 응답 `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "API 명세서 검토",
      "description": "API 명세서를 검토하고 피드백을 정리한다.",
      "status": "IN_PROGRESS",
      "startDate": "2026-05-27",
      "endDate": "2026-05-29",
      "category": {
        "id": "uuid",
        "name": "업무"
      },
      "createdAt": "2026-05-27T00:00:00.000Z",
      "updatedAt": "2026-05-27T00:00:00.000Z"
    }
  ]
}
```

> `status`는 서버가 현재 시각 기준으로 계산하여 반환합니다. 프론트엔드에서 별도로 계산할 필요 없습니다.

---

#### POST /todos — 할 일 생성

**인증 필요**

**요청**
```json
{
  "title": "API 명세서 검토",
  "description": "API 명세서를 검토하고 피드백을 정리한다.",
  "categoryId": "uuid",
  "startDate": "2026-05-27",
  "endDate": "2026-05-29"
}
```

필수 필드: `title`  
선택 필드: `description`, `categoryId`, `startDate`, `endDate`

- `categoryId` 미전달 시 `기본` 카테고리 자동 적용
- 날짜 형식: `YYYY-MM-DD`

**성공 응답 `201`**
```json
{
  "data": {
    "id": "uuid",
    "title": "API 명세서 검토",
    "description": "API 명세서를 검토하고 피드백을 정리한다.",
    "status": "IN_PROGRESS",
    "startDate": "2026-05-27",
    "endDate": "2026-05-29",
    "category": {
      "id": "uuid",
      "name": "업무"
    },
    "createdAt": "2026-05-27T00:00:00.000Z",
    "updatedAt": "2026-05-27T00:00:00.000Z"
  }
}
```

---

#### PATCH /todos/:id — 할 일 수정

**인증 필요**

변경할 필드만 포함합니다 (부분 업데이트).

**요청**
```json
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "categoryId": "uuid",
  "startDate": "2026-05-28",
  "endDate": "2026-05-30"
}
```

**성공 응답 `200`** — 생성 응답과 동일한 구조

---

#### DELETE /todos/:id — 할 일 삭제

**인증 필요**

**성공 응답 `200`**
```json
{
  "data": {}
}
```

---

#### PATCH /todos/:id/complete — 완료 처리

**인증 필요**

**요청 본문**: 없음

**성공 응답 `200`** — 수정된 할 일 객체 반환, `status: "DONE"`

---

#### PATCH /todos/:id/incomplete — 완료 취소

**인증 필요**

**요청 본문**: 없음

**성공 응답 `200`** — 수정된 할 일 객체 반환, 현재 날짜 기준으로 상태 재계산

---

## 6. 할 일 상태 계산 규칙

상태는 서버가 계산하여 응답에 포함합니다. 프론트엔드는 **API 응답 `status` 값을 그대로 표시**하면 됩니다.

| 상태 | 조건 | 색상 토큰 |
|------|------|-----------|
| `DONE` | DB에 완료 표시된 경우 (날짜 무관) | `color-green` |
| `IN_PROGRESS` | `startDate <= 오늘 <= endDate` | `color-blue` |
| `OVERDUE` | `오늘 > endDate` AND 미완료 | `color-red` |
| `NOT_STARTED` | 날짜 없음, 또는 `오늘 < startDate` | `color-gray` |

**엣지 케이스**

| 상황 | 결과 |
|------|------|
| `startDate`, `endDate` 모두 null | `NOT_STARTED` |
| `startDate`만 있고 `오늘 >= startDate` | `IN_PROGRESS` (OVERDUE 없음) |
| `endDate`만 있고 `오늘 > endDate` | `OVERDUE` |
| 오늘 = `endDate` (당일) | `IN_PROGRESS` (OVERDUE 아님) |
| `startDate` = `endDate` = 내일 | `NOT_STARTED` |

---

## 7. 프론트엔드 구현 패턴

### 7.1 API Client 구조 (`lib/apiClient.ts`)

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    useAuthStore.getState().clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const json = await res.json();

  if (!res.ok) {
    // error.code를 에러 객체에 포함해서 throw
    const err = new Error(json.error?.message ?? 'Unknown error');
    (err as any).code = json.error?.code;
    throw err;
  }

  return json.data as T;
}
```

### 7.2 Zustand Auth Store (`store/authStore.ts`)

```typescript
interface AuthState {
  accessToken: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setToken: (token) => set({ accessToken: token }),
      clearToken: () => set({ accessToken: null }),
    }),
    { name: 'auth' } // localStorage key
  )
);
```

### 7.3 TanStack Query 키 규칙

일관된 캐시 무효화를 위해 쿼리 키를 계층 구조로 정의합니다.

```typescript
export const queryKeys = {
  todos: {
    all: ['todos'] as const,
    list: (filters?: TodoFilters) => ['todos', 'list', filters] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => ['categories', 'list'] as const,
  },
  user: {
    me: () => ['user', 'me'] as const,
  },
};
```

### 7.4 캐시 무효화 패턴

```typescript
// 할 일 생성/수정/삭제 후
queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });

// 카테고리 삭제 후 (할 일이 기본 카테고리로 이동되므로)
queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });

// 설정 변경 후
queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
```

### 7.5 완료 토글 낙관적 업데이트

```typescript
const completeMutation = useMutation({
  mutationFn: (id: string) => todosApi.complete(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.todos.all });
    const previous = queryClient.getQueryData(queryKeys.todos.list());
    queryClient.setQueryData(queryKeys.todos.list(), (old: Todo[]) =>
      old.map((t) => (t.id === id ? { ...t, status: 'DONE' } : t))
    );
    return { previous };
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(queryKeys.todos.list(), context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
  },
});
```

### 7.6 설정 낙관적 업데이트 (테마)

```typescript
const settingsMutation = useMutation({
  mutationFn: (patch: { theme?: Theme; language?: Language }) =>
    settingsApi.update(patch),
  onMutate: async (patch) => {
    const previous = queryClient.getQueryData(queryKeys.user.me());
    queryClient.setQueryData(queryKeys.user.me(), (old: User) => ({
      ...old,
      ...patch,
    }));
    return { previous };
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(queryKeys.user.me(), context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
  },
});
```

### 7.7 Private Route 패턴

```typescript
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

### 7.8 401 에러 전역 처리 (TanStack Query)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false; // 401은 재시도 안 함
        return failureCount < 2;
      },
    },
  },
});
```

---

## 8. 화면별 연동 가이드

### 8.1 로그인 페이지 (`/login`)

**API**: `POST /auth/login`

| 에러 코드 | UI 처리 |
|-----------|---------|
| `AUTH_INVALID_CREDENTIALS` | "이메일 또는 비밀번호가 올바르지 않습니다." 인라인 메시지 |

**성공 흐름**: `accessToken` → `useAuthStore.setToken()` → `/todos` 이동

---

### 8.2 회원가입 페이지 (`/register`)

**API**: `POST /auth/register`

| 에러 코드 | UI 처리 |
|-----------|---------|
| `AUTH_EMAIL_DUPLICATE` | 이메일 필드 아래 "이미 사용 중인 이메일입니다." |
| `AUTH_PASSWORD_WEAK` | 비밀번호 필드 아래 규칙 안내 (orange 경고) |
| `VALIDATION_ERROR` | 해당 필드 아래 인라인 오류 |

**클라이언트 사전 검증**:
- 이메일: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 비밀번호: `/^(?=.*[a-zA-Z])(?=.*\d).{8,128}$/`
- 이름: 1~50자

**성공 흐름**: 가입 완료 → `/login` 이동 (또는 자동 로그인 → `/todos`)

---

### 8.3 할 일 목록 페이지 (`/todos`)

**API**: `GET /todos` (with filters)

**필터 파라미터 매핑**:

```typescript
// 상태 필터
GET /todos?status=IN_PROGRESS

// 카테고리 필터
GET /todos?categoryId={uuid}

// AND 조건
GET /todos?status=OVERDUE&categoryId={uuid}

// 날짜 범위 필터
GET /todos?dueDateFrom=2026-05-01&dueDateTo=2026-05-31
```

**캐시 키에 필터 포함**:
```typescript
useQuery({
  queryKey: queryKeys.todos.list({ status, categoryId, dueDateFrom, dueDateTo }),
  queryFn: () => todosApi.list({ status, categoryId, dueDateFrom, dueDateTo }),
});
```

---

### 8.4 할 일 등록/수정 모달

**API**: `POST /todos` / `PATCH /todos/:id`

| 에러 코드 | UI 처리 |
|-----------|---------|
| `TODO_TITLE_TOO_LONG` | 제목 필드 아래 오류 (클라이언트에서 100자 제한으로 사전 차단 권장) |
| `TODO_DESC_TOO_LONG` | 설명 필드 아래 오류 |
| `TODO_DATE_INVALID` | 날짜 필드 아래 오류, 저장 버튼 비활성화 |
| `CATEGORY_NOT_FOUND` | 일반 오류 Toast |

**카테고리 드롭다운**: `GET /categories`로 목록을 미리 불러와 선택. `categoryId` 미선택 시 서버가 `기본` 카테고리 자동 적용.

---

### 8.5 카테고리 관리 페이지 (`/categories`)

**API**: `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`

| 상황 | UI 처리 |
|------|---------|
| `isDefault: true` 항목 | 수정/삭제 버튼 비활성화 (opacity 0.3, pointer-events: none) |
| `CATEGORY_NAME_DUPLICATE` | 입력 필드 아래 "이미 존재하는 카테고리 이름입니다." |
| 삭제 전 | "할 일 N개가 기본 카테고리로 이동됩니다" 확인 다이얼로그 표시 |
| 삭제 성공 | 카테고리 + 할 일 목록 캐시 동시 무효화 |

---

### 8.6 설정 페이지 (`/settings`)

**API**: `PATCH /users/me/settings`

**테마 전환**: 낙관적 업데이트 적용 (서버 응답 전 UI 즉시 변경).  
저장 실패 시 이전 테마로 롤백.

```typescript
// 테마 적용 방식 (CSS class 기반)
document.documentElement.classList.toggle('dark', theme === 'DARK');
```

**언어 전환**: `i18next.changeLanguage(language)` 호출 후 서버 저장.

---

### 8.7 프로필 페이지 (`/profile`)

**API**: `PATCH /users/me`, `DELETE /users/me`

| 에러 코드 | UI 처리 |
|-----------|---------|
| `AUTH_PASSWORD_MISMATCH` | "현재 비밀번호가 올바르지 않습니다." |
| `AUTH_PASSWORD_WEAK` | 새 비밀번호 필드 아래 규칙 안내 |

**회원 탈퇴**: 확인 다이얼로그 → `DELETE /users/me` → `clearToken()` → `/login` 이동.

---

### 8.8 캘린더 뷰 (`/calendar`)

**API**: `GET /todos?dueDateFrom=YYYY-MM-01&dueDateTo=YYYY-MM-31`

월 이동 시 해당 월의 `dueDateFrom`, `dueDateTo`로 재요청합니다.

```typescript
const year = selectedDate.getFullYear();
const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
const from = `${year}-${month}-01`;
const to = `${year}-${month}-${lastDay}`;

useQuery({
  queryKey: queryKeys.todos.list({ dueDateFrom: from, dueDateTo: to }),
  queryFn: () => todosApi.list({ dueDateFrom: from, dueDateTo: to }),
});
```

**날짜-할 일 매핑**: 응답의 `endDate` 기준으로 달력 셀에 배치합니다.

```typescript
const todosByDate = todos.reduce((acc, todo) => {
  if (!todo.endDate) return acc;
  const key = todo.endDate; // "YYYY-MM-DD"
  acc[key] = [...(acc[key] ?? []), todo];
  return acc;
}, {} as Record<string, Todo[]>);
```

---

## 9. TypeScript 타입 정의

```typescript
// types/index.ts

export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'OVERDUE' | 'DONE';
export type Theme = 'LIGHT' | 'DARK';
export type Language = 'ko' | 'en';

export interface User {
  id: string;
  email: string;
  name: string;
  theme: Theme;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null;   // "YYYY-MM-DD"
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilters {
  status?: TodoStatus;
  categoryId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface ApiError {
  code: string;
  message: string;
  stack?: string; // 개발 환경에서만 포함
}

// API 응답 래퍼
export interface ApiResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: ApiError;
}
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-05-28 | 최초 작성 |
