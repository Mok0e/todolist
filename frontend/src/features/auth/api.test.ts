import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/apiClient', () => ({ apiClient: mockApiClient }))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('register — POST /auth/register 호출', async () => {
    const { authApi } = await import('@/features/auth/api')
    const body = { email: 'a@b.com', password: 'pass1234', name: '홍' }
    mockApiClient.post.mockResolvedValue({ id: '1', email: 'a@b.com', name: '홍' })
    await authApi.register(body)
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', body)
  })

  it('login — POST /auth/login 호출', async () => {
    const { authApi } = await import('@/features/auth/api')
    const body = { email: 'a@b.com', password: 'pass1234' }
    mockApiClient.post.mockResolvedValue({ accessToken: 'tok' })
    await authApi.login(body)
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', body)
  })

  it('getMe — GET /users/me 호출', async () => {
    const { authApi } = await import('@/features/auth/api')
    mockApiClient.get.mockResolvedValue({ id: '1' })
    await authApi.getMe()
    expect(mockApiClient.get).toHaveBeenCalledWith('/users/me')
  })

  it('updateProfile — PATCH /users/me 호출', async () => {
    const { authApi } = await import('@/features/auth/api')
    const body = { name: '새이름' }
    mockApiClient.patch.mockResolvedValue({ id: '1', name: '새이름' })
    await authApi.updateProfile(body)
    expect(mockApiClient.patch).toHaveBeenCalledWith('/users/me', body)
  })

  it('deleteAccount — DELETE /users/me 호출', async () => {
    const { authApi } = await import('@/features/auth/api')
    mockApiClient.delete.mockResolvedValue({})
    await authApi.deleteAccount()
    expect(mockApiClient.delete).toHaveBeenCalledWith('/users/me')
  })
})
