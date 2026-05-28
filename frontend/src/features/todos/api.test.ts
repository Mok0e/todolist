import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/apiClient', () => ({ apiClient: mockApiClient }))

describe('todosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list — GET /todos 호출 (필터 없음)', async () => {
    const { todosApi } = await import('@/features/todos/api')
    mockApiClient.get.mockResolvedValue([])
    await todosApi.list()
    expect(mockApiClient.get).toHaveBeenCalledWith('/todos', { params: undefined })
  })

  it('list — GET /todos 필터 포함 호출', async () => {
    const { todosApi } = await import('@/features/todos/api')
    const filters = { status: 'DONE' as const, categoryId: 'cat-1' }
    mockApiClient.get.mockResolvedValue([])
    await todosApi.list(filters)
    expect(mockApiClient.get).toHaveBeenCalledWith('/todos', { params: filters })
  })

  it('create — POST /todos 호출', async () => {
    const { todosApi } = await import('@/features/todos/api')
    const body = { title: '할 일' }
    mockApiClient.post.mockResolvedValue({ id: '1', title: '할 일' })
    await todosApi.create(body)
    expect(mockApiClient.post).toHaveBeenCalledWith('/todos', body)
  })

  it('update — PATCH /todos/:id 호출', async () => {
    const { todosApi } = await import('@/features/todos/api')
    const body = { title: '수정됨' }
    mockApiClient.patch.mockResolvedValue({ id: '1', title: '수정됨' })
    await todosApi.update('1', body)
    expect(mockApiClient.patch).toHaveBeenCalledWith('/todos/1', body)
  })

  it('remove — DELETE /todos/:id 호출', async () => {
    const { todosApi } = await import('@/features/todos/api')
    mockApiClient.delete.mockResolvedValue({})
    await todosApi.remove('1')
    expect(mockApiClient.delete).toHaveBeenCalledWith('/todos/1')
  })

  it('complete — PATCH /todos/:id/complete 호출', async () => {
    const { todosApi } = await import('@/features/todos/api')
    mockApiClient.patch.mockResolvedValue({ id: '1', status: 'DONE' })
    await todosApi.complete('1')
    expect(mockApiClient.patch).toHaveBeenCalledWith('/todos/1/complete')
  })

  it('incomplete — PATCH /todos/:id/incomplete 호출', async () => {
    const { todosApi } = await import('@/features/todos/api')
    mockApiClient.patch.mockResolvedValue({ id: '1', status: 'NOT_STARTED' })
    await todosApi.incomplete('1')
    expect(mockApiClient.patch).toHaveBeenCalledWith('/todos/1/incomplete')
  })
})
