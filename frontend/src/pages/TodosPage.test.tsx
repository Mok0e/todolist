import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { TodosPage } from './TodosPage'
import type { Todo, Category } from '@/types'

vi.mock('@/features/todos/api')
vi.mock('@/features/categories/api')

import { todosApi } from '@/features/todos/api'
import { categoriesApi } from '@/features/categories/api'

const mockedTodosApi = vi.mocked(todosApi)
const mockedCategoriesApi = vi.mocked(categoriesApi)

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'API 명세서 검토',
    description: '설명',
    status: 'IN_PROGRESS',
    startDate: '2026-05-27',
    endDate: '2026-05-29',
    category: { id: 'cat1', name: '업무' },
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: '2',
    title: '주간 보고서 작성',
    description: null,
    status: 'NOT_STARTED',
    startDate: null,
    endDate: null,
    category: { id: 'cat2', name: '개인' },
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
]

const mockCategories: Category[] = [
  { id: 'cat1', name: '업무', isDefault: false, createdAt: '2026-05-27T00:00:00.000Z', updatedAt: '2026-05-27T00:00:00.000Z' },
  { id: 'cat2', name: '개인', isDefault: true, createdAt: '2026-05-27T00:00:00.000Z', updatedAt: '2026-05-27T00:00:00.000Z' },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/todos', element: <TodosPage /> }], {
    initialEntries: ['/todos'],
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedCategoriesApi.list.mockResolvedValue(mockCategories)
})

describe('TodosPage', () => {
  it('로딩 중 Skeleton이 표시된다', () => {
    mockedTodosApi.list.mockReturnValue(new Promise(() => {}))
    createWrapper()
    expect(screen.getByTestId('todos-skeleton')).toBeInTheDocument()
  })

  it('todos 로드 후 TodoCard들이 렌더링된다', async () => {
    mockedTodosApi.list.mockResolvedValue(mockTodos)
    createWrapper()
    await waitFor(() => {
      expect(screen.getByText('API 명세서 검토')).toBeInTheDocument()
      expect(screen.getByText('주간 보고서 작성')).toBeInTheDocument()
    })
  })

  it('빈 목록이면 EmptyState가 표시된다', async () => {
    mockedTodosApi.list.mockResolvedValue([])
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('todos-empty')).toBeInTheDocument()
    })
  })

  it('상태 필터 클릭 시 API에 status 파라미터가 전달된다', async () => {
    const user = userEvent.setup()
    mockedTodosApi.list.mockResolvedValue(mockTodos)
    createWrapper()

    await waitFor(() => {
      expect(screen.getByText('API 명세서 검토')).toBeInTheDocument()
    })

    mockedTodosApi.list.mockResolvedValue([mockTodos[0]])
    await user.click(screen.getByRole('button', { name: '진행중' }))

    await waitFor(() => {
      expect(mockedTodosApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'IN_PROGRESS' })
      )
    })
  })

  it('"할 일 추가" 버튼 클릭 시 TodoForm/Modal이 표시된다', async () => {
    const user = userEvent.setup()
    mockedTodosApi.list.mockResolvedValue(mockTodos)
    createWrapper()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /할 일 추가/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /할 일 추가/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
