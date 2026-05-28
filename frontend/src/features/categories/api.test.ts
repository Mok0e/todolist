import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/apiClient', () => ({ apiClient: mockApiClient }))

describe('categoriesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list — GET /categories 호출', async () => {
    const { categoriesApi } = await import('@/features/categories/api')
    mockApiClient.get.mockResolvedValue([])
    await categoriesApi.list()
    expect(mockApiClient.get).toHaveBeenCalledWith('/categories')
  })

  it('create — POST /categories 호출', async () => {
    const { categoriesApi } = await import('@/features/categories/api')
    const body = { name: '업무' }
    mockApiClient.post.mockResolvedValue({ id: '1', name: '업무' })
    await categoriesApi.create(body)
    expect(mockApiClient.post).toHaveBeenCalledWith('/categories', body)
  })

  it('update — PATCH /categories/:id 호출', async () => {
    const { categoriesApi } = await import('@/features/categories/api')
    const body = { name: '개인' }
    mockApiClient.patch.mockResolvedValue({ id: '1', name: '개인' })
    await categoriesApi.update('1', body)
    expect(mockApiClient.patch).toHaveBeenCalledWith('/categories/1', body)
  })

  it('remove — DELETE /categories/:id 호출', async () => {
    const { categoriesApi } = await import('@/features/categories/api')
    mockApiClient.delete.mockResolvedValue({})
    await categoriesApi.remove('1')
    expect(mockApiClient.delete).toHaveBeenCalledWith('/categories/1')
  })
})
