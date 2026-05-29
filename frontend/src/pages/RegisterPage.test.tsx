import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RegisterPage } from './RegisterPage'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/features/auth/api')

import { authApi } from '@/features/auth/api'

const mockedAuthApi = vi.mocked(authApi)

function renderRegisterPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/todos" element={<div>Todos Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.getState().clearToken()
})

describe('RegisterPage', () => {
  it('이름, 이메일, 비밀번호 입력 필드와 회원가입 버튼이 렌더링된다', () => {
    renderRegisterPage()
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /회원가입/i })).toBeInTheDocument()
  })

  it('"로그인" 링크가 존재한다', () => {
    renderRegisterPage()
    expect(screen.getByRole('link', { name: /로그인/i })).toBeInTheDocument()
  })

  it('이메일 형식이 올바르지 않을 때 오류 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText(/이름/i), '홍길동')
    await user.type(screen.getByLabelText(/이메일/i), 'invalid-email')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /회원가입/i }))

    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일/i)).toBeInTheDocument()
    })
  })

  it('비밀번호가 규칙을 충족하지 않을 때 오류 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText(/이름/i), '홍길동')
    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'abc')
    await user.click(screen.getByRole('button', { name: /회원가입/i }))

    await waitFor(() => {
      expect(screen.getByText(/8자 이상|영문.*숫자|비밀번호 규칙/i)).toBeInTheDocument()
    })
  })

  it('회원가입 성공 시 authApi.login이 자동으로 호출되고 /todos로 이동한다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.register.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      name: '홍길동',
    })
    mockedAuthApi.login.mockResolvedValue({ accessToken: 'test-token' })

    renderRegisterPage()

    await user.type(screen.getByLabelText(/이름/i), '홍길동')
    await user.type(screen.getByLabelText(/이메일/i), 'new@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /회원가입/i }))

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Todos Page')).toBeInTheDocument()
    })
  })

  it('AUTH_EMAIL_DUPLICATE 오류 시 "이미 사용 중인 이메일입니다." 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.register.mockRejectedValue({
      code: 'AUTH_EMAIL_DUPLICATE',
      message: 'Email already in use',
    })

    renderRegisterPage()

    await user.type(screen.getByLabelText(/이름/i), '홍길동')
    await user.type(screen.getByLabelText(/이메일/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /회원가입/i }))

    await waitFor(() => {
      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument()
    })
  })
})
