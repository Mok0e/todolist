import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './LoginPage'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/features/auth/api')

import { authApi } from '@/features/auth/api'

const mockedAuthApi = vi.mocked(authApi)

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/todos" element={<div>Todos Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.getState().clearToken()
})

describe('LoginPage', () => {
  it('이메일, 비밀번호 입력 필드와 로그인 버튼이 렌더링된다', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument()
  })

  it('"회원가입" 링크가 존재한다', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /회원가입/i })).toBeInTheDocument()
  })

  it('폼 제출 시 authApi.login이 호출된다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.login.mockResolvedValue({ accessToken: 'test-token' })

    renderLoginPage()

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /로그인/i }))

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('로그인 성공 시 /todos로 이동한다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.login.mockResolvedValue({ accessToken: 'test-token' })

    renderLoginPage()

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /로그인/i }))

    await waitFor(() => {
      expect(screen.getByText('Todos Page')).toBeInTheDocument()
    })
  })

  it('로그인 성공 시 useAuthStore.setToken이 호출된다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.login.mockResolvedValue({ accessToken: 'test-token' })

    renderLoginPage()

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /로그인/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe('test-token')
    })
  })

  it('AUTH_INVALID_CREDENTIALS 오류 시 오류 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.login.mockRejectedValue({
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Invalid credentials',
    })

    renderLoginPage()

    await user.type(screen.getByLabelText(/이메일/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /로그인/i }))

    await waitFor(() => {
      expect(
        screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')
      ).toBeInTheDocument()
    })
  })

  it('로딩 중에는 로그인 버튼이 비활성화된다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.login.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ accessToken: 'token' }), 500))
    )

    renderLoginPage()

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /로그인/i }))

    expect(screen.getByRole('button', { name: /로딩 중/i })).toBeDisabled()
  })
})
