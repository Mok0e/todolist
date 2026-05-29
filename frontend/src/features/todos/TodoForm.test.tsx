import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TodoForm } from './TodoForm'
import type { Todo, Category } from '@/types'

vi.mock('@/features/todos/api')
vi.mock('@/features/categories/api')

import { todosApi } from '@/features/todos/api'

const mockedTodosApi = vi.mocked(todosApi)

const mockTodo: Todo = {
  id: '1',
  title: 'API 명세서 검토',
  description: '설명',
  status: 'IN_PROGRESS',
  startDate: '2026-05-27',
  endDate: '2026-05-29',
  category: { id: 'cat1', name: '업무' },
  createdAt: '2026-05-27T00:00:00.000Z',
  updatedAt: '2026-05-27T00:00:00.000Z',
}

const mockCategories: Category[] = [
  { id: 'cat1', name: '업무', isDefault: false, createdAt: '2026-05-27T00:00:00.000Z', updatedAt: '2026-05-27T00:00:00.000Z' },
  { id: 'cat2', name: '개인', isDefault: false, createdAt: '2026-05-27T00:00:00.000Z', updatedAt: '2026-05-27T00:00:00.000Z' },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

function renderForm(props?: Partial<Parameters<typeof TodoForm>[0]>) {
  const defaultProps = {
    categories: mockCategories,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
    ...props,
  }
  return { ...render(<TodoForm {...defaultProps} />, { wrapper: createWrapper() }), props: defaultProps }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TodoForm', () => {
  describe('신규 등록', () => {
    it('title 입력 필드가 빈 상태로 렌더링된다', () => {
      renderForm()
      expect(screen.getByLabelText(/제목/i)).toHaveValue('')
    })

    it('카테고리 선택 옵션이 렌더링된다', () => {
      renderForm()
      expect(screen.getByText('업무')).toBeInTheDocument()
      expect(screen.getByText('개인')).toBeInTheDocument()
    })

    it('날짜 입력 필드가 렌더링된다', () => {
      renderForm()
      expect(screen.getByLabelText(/시작일/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/종료일/i)).toBeInTheDocument()
    })
  })

  describe('수정', () => {
    it('todo 데이터로 title 입력 필드가 초기화된다', () => {
      renderForm({ todo: mockTodo })
      expect(screen.getByLabelText(/제목/i)).toHaveValue('API 명세서 검토')
    })
  })

  describe('유효성 검사', () => {
    it('title 미입력 시 제출하면 오류 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      renderForm()
      await user.click(screen.getByRole('button', { name: /저장/i }))
      await waitFor(() => {
        expect(screen.getByText(/제목/i)).toBeInTheDocument()
      })
    })

    it('title 100자 초과 시 오류 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      renderForm()
      const longTitle = 'a'.repeat(101)
      await user.type(screen.getByLabelText(/제목/i), longTitle)
      await user.click(screen.getByRole('button', { name: /저장/i }))
      await waitFor(() => {
        expect(screen.getByText(/100자/i)).toBeInTheDocument()
      })
    })
  })

  describe('제출', () => {
    it('신규 등록 성공 시 onSuccess가 호출된다', async () => {
      const user = userEvent.setup()
      mockedTodosApi.create.mockResolvedValue(mockTodo)
      const { props } = renderForm()
      await user.type(screen.getByLabelText(/제목/i), '새 할 일')
      await user.click(screen.getByRole('button', { name: /저장/i }))
      await waitFor(() => {
        expect(props.onSuccess).toHaveBeenCalledTimes(1)
      })
    })

    it('수정 성공 시 onSuccess가 호출된다', async () => {
      const user = userEvent.setup()
      mockedTodosApi.update.mockResolvedValue({ ...mockTodo, title: '수정된 제목' })
      const { props } = renderForm({ todo: mockTodo })
      const titleInput = screen.getByLabelText(/제목/i)
      await user.clear(titleInput)
      await user.type(titleInput, '수정된 제목')
      await user.click(screen.getByRole('button', { name: /저장/i }))
      await waitFor(() => {
        expect(props.onSuccess).toHaveBeenCalledTimes(1)
      })
    })
  })

  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()
    await user.click(screen.getByRole('button', { name: /취소/i }))
    expect(props.onCancel).toHaveBeenCalledTimes(1)
  })

  it('categories prop으로 카테고리 선택 옵션이 렌더링된다', () => {
    renderForm()
    const options = screen.getAllByRole('option')
    const optionTexts = options.map((o) => o.textContent)
    expect(optionTexts).toContain('업무')
    expect(optionTexts).toContain('개인')
  })
})
