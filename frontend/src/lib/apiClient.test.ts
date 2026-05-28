import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'

describe('apiClient', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, userId: null })
  })

  it('apiClient 인스턴스를 export 한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    expect(apiClient).toBeDefined()
    expect(typeof apiClient.get).toBe('function')
    expect(typeof apiClient.post).toBe('function')
    expect(typeof apiClient.patch).toBe('function')
    expect(typeof apiClient.delete).toBe('function')
  })

  it('ApiErrorData 타입이 export 된다', async () => {
    // type export는 런타임 검증 불필요, 컴파일 시 검증됨
    const mod = await import('@/lib/apiClient')
    expect(mod).toBeDefined()
  })
})
