import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  if (!accessToken) return <div data-testid="redirected-to-login">Redirected to Login</div>
  return <>{children}</>
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, userId: null })
  })

  it('토큰 없이 보호된 라우트 접근 시 리다이렉트 표시', () => {
    render(
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/todos" element={<PrivateRoute><div>Todos Content</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('redirected-to-login')).toBeDefined()
    expect(screen.queryByText('Todos Content')).toBeNull()
  })

  it('토큰 있을 때 보호된 라우트 접근 성공', () => {
    useAuthStore.setState({ accessToken: 'valid-token', userId: 'user-1' })
    render(
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/todos" element={<PrivateRoute><div>Todos Content</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Todos Content')).toBeDefined()
  })
})
