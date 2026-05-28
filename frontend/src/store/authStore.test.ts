import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, userId: null })
    localStorage.clear()
  })

  it('초기 상태는 null이어야 한다', () => {
    const { accessToken, userId } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(userId).toBeNull()
  })

  it('setToken으로 토큰과 userId를 설정한다', () => {
    useAuthStore.getState().setToken('test-token-123', 'user-456')
    const { accessToken, userId } = useAuthStore.getState()
    expect(accessToken).toBe('test-token-123')
    expect(userId).toBe('user-456')
  })

  it('clearToken으로 토큰과 userId를 초기화한다', () => {
    useAuthStore.getState().setToken('test-token', 'user-id')
    useAuthStore.getState().clearToken()
    const { accessToken, userId } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(userId).toBeNull()
  })
})
