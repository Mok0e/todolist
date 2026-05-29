import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { CategoriesPage } from './CategoriesPage'
import type { Category } from '@/types'

vi.mock('@/features/categories/api')

import { categoriesApi } from '@/features/categories/api'

const mockedCategoriesApi = vi.mocked(categoriesApi)

const mockCategories: Category[] = [
  {
    id: 'cat-default',
    name: '기본',
    isDefault: true,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'cat-1',
    name: '업무',
    isDefault: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: '개인',
    isDefault: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [{ path: '/categories', element: <CategoriesPage /> }],
    { initialEntries: ['/categories'] }
  )
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

describe('CategoriesPage', () => {
  it('로딩 중 Skeleton이 표시된다', () => {
    mockedCategoriesApi.list.mockReturnValue(new Promise(() => {}))
    createWrapper()
    expect(screen.getByTestId('categories-skeleton')).toBeInTheDocument()
  })

  it('카테고리 목록이 렌더링된다', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.getByText('기본')).toBeInTheDocument()
      expect(screen.getByText('업무')).toBeInTheDocument()
      expect(screen.getByText('개인')).toBeInTheDocument()
    })
  })

  it('기본 카테고리 행에는 수정/삭제 버튼이 비활성화되어 있다', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('default-category')).toBeInTheDocument()
    })
    const defaultRow = screen.getByTestId('default-category')
    expect(within(defaultRow).getByRole('button', { name: '기본 수정' })).toBeDisabled()
    expect(within(defaultRow).getByRole('button', { name: '기본 삭제' })).toBeDisabled()
  })

  it('"카테고리 추가" 버튼 클릭 시 인라인 폼이 표시된다', async () => {
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /카테고리 추가/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /카테고리 추가/i }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('카테고리 추가 성공 시 폼이 닫힌다', async () => {
    const user = userEvent.setup()
    const newCategory: Category = {
      id: 'cat-3',
      name: '취미',
      isDefault: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z',
    }
    mockedCategoriesApi.create.mockResolvedValue(newCategory)
    createWrapper()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /카테고리 추가/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /카테고리 추가/i }))
    await user.type(screen.getByRole('textbox'), '취미')
    await user.click(screen.getByRole('button', { name: '추가' }))

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).toBeNull()
    })
  })

  it('CATEGORY_NAME_DUPLICATE 에러 시 오류 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    mockedCategoriesApi.create.mockRejectedValue({
      code: 'CATEGORY_NAME_DUPLICATE',
      message: '이미 존재하는 카테고리 이름입니다.',
    })
    createWrapper()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /카테고리 추가/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /카테고리 추가/i }))
    await user.type(screen.getByRole('textbox'), '업무')
    await user.click(screen.getByRole('button', { name: '추가' }))

    await waitFor(() => {
      expect(screen.getByText('이미 존재하는 카테고리 이름입니다.')).toBeInTheDocument()
    })
  })

  it('수정 버튼 클릭 시 인라인 편집 폼이 표시되고 기존 값이 입력된다', async () => {
    const user = userEvent.setup()
    createWrapper()

    await waitFor(() => {
      expect(screen.getByText('업무')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /수정/i })
    // 기본 카테고리(인덱스 0)를 제외한 첫 번째 수정 버튼 (업무)
    await user.click(editButtons[1]!)

    const textbox = screen.getByRole('textbox')
    expect(textbox).toBeInTheDocument()
    expect(textbox).toHaveValue('업무')
  })

  it('삭제 버튼 클릭 시 confirm 다이얼로그 후 삭제 API가 호출된다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockedCategoriesApi.remove.mockResolvedValue({})
    createWrapper()

    await waitFor(() => {
      expect(screen.getByText('업무')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /삭제/i })
    // 기본 카테고리(인덱스 0)를 제외한 첫 번째 삭제 버튼 (업무)
    await user.click(deleteButtons[1]!)

    expect(window.confirm).toHaveBeenCalled()
    await waitFor(() => {
      expect(mockedCategoriesApi.remove).toHaveBeenCalledWith('cat-1')
    })
  })
})
