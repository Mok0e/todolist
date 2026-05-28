import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/apiClient', () => ({ apiClient: mockApiClient }))

describe('settingsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('update — PATCH /users/me/settings 호출 (theme)', async () => {
    const { settingsApi } = await import('@/features/settings/api')
    const body = { theme: 'DARK' as const }
    mockApiClient.patch.mockResolvedValue({ theme: 'DARK', language: 'ko' })
    await settingsApi.update(body)
    expect(mockApiClient.patch).toHaveBeenCalledWith('/users/me/settings', body)
  })

  it('update — PATCH /users/me/settings 호출 (language)', async () => {
    const { settingsApi } = await import('@/features/settings/api')
    const body = { language: 'en' as const }
    mockApiClient.patch.mockResolvedValue({ theme: 'LIGHT', language: 'en' })
    await settingsApi.update(body)
    expect(mockApiClient.patch).toHaveBeenCalledWith('/users/me/settings', body)
  })
})
