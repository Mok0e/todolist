import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/apiClient', () => ({ apiClient: mockApiClient }))

describe('calendarApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list — GET /todos with dueDateFrom, dueDateTo 호출', async () => {
    const { calendarApi } = await import('@/features/calendar/api')
    mockApiClient.get.mockResolvedValue([])
    await calendarApi.list('2026-05-01', '2026-05-31')
    expect(mockApiClient.get).toHaveBeenCalledWith('/todos', {
      params: { dueDateFrom: '2026-05-01', dueDateTo: '2026-05-31' },
    })
  })

  it('list — 빈 배열 반환 시 정상 처리', async () => {
    const { calendarApi } = await import('@/features/calendar/api')
    mockApiClient.get.mockResolvedValue([])
    const result = await calendarApi.list('2026-06-01', '2026-06-30')
    expect(result).toEqual([])
  })
})
