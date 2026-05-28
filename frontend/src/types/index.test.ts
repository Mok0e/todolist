import type { TodoStatus, User, Category, Todo, ApiResponse, ApiError } from './index'

describe('TypeScript 타입 정의', () => {
  it('TodoStatus 타입이 4가지 값을 허용한다', () => {
    const statuses: TodoStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE', 'DONE']
    expect(statuses).toHaveLength(4)
  })

  it('User 타입 객체를 생성할 수 있다', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: '홍길동',
      theme: 'LIGHT',
      language: 'ko',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(user.email).toBe('test@example.com')
  })

  it('Category 타입 객체를 생성할 수 있다', () => {
    const category: Category = {
      id: '1',
      name: '기본',
      isDefault: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(category.isDefault).toBe(true)
  })

  it('Todo 타입 객체를 생성할 수 있다', () => {
    const todo: Todo = {
      id: '1',
      title: '테스트 할 일',
      description: null,
      status: 'NOT_STARTED',
      startDate: null,
      endDate: null,
      category: { id: '1', name: '기본' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(todo.status).toBe('NOT_STARTED')
  })

  it('ApiResponse<T> 제네릭 타입이 동작한다', () => {
    const response: ApiResponse<User> = {
      data: {
        id: '1',
        email: 'test@example.com',
        name: '홍길동',
        theme: 'LIGHT',
        language: 'ko',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    }
    expect(response.data.name).toBe('홍길동')
  })

  it('ApiError 타입 객체를 생성할 수 있다', () => {
    const error: ApiError = {
      error: {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      },
    }
    expect(error.error.code).toBe('AUTH_INVALID_CREDENTIALS')
  })
})
