import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileForm } from './ProfileForm'
import type { User } from '@/types'

vi.mock('@/features/auth/api')

import { authApi } from '@/features/auth/api'

const mockedAuthApi = vi.mocked(authApi)

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'LIGHT',
  language: 'ko',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function renderProfileForm(user: User = mockUser) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfileForm user={user} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileForm', () => {
  it('이름, 이메일, 현재 비밀번호, 새 비밀번호 필드가 렌더링된다', () => {
    renderProfileForm()
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/현재 비밀번호/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/새 비밀번호/i)).toBeInTheDocument()
  })

  it('이메일 필드가 readOnly 또는 disabled 상태다', () => {
    renderProfileForm()
    const emailInput = screen.getByLabelText(/이메일/i)
    const isReadOnly = emailInput.hasAttribute('readonly') || emailInput.hasAttribute('readOnly')
    const isDisabled = emailInput.hasAttribute('disabled')
    expect(isReadOnly || isDisabled).toBe(true)
  })

  it('이메일 필드에 현재 사용자 이메일이 표시된다', () => {
    renderProfileForm()
    expect(screen.getByLabelText(/이메일/i)).toHaveValue('test@example.com')
  })

  it('이름 수정 후 제출 시 authApi.updateProfile이 호출된다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.updateProfile.mockResolvedValue({ ...mockUser, name: '김철수' })

    renderProfileForm()

    const nameInput = screen.getByLabelText(/이름/i)
    await user.clear(nameInput)
    await user.type(nameInput, '김철수')
    await user.click(screen.getByRole('button', { name: /저장|수정|확인/i }))

    await waitFor(() => {
      expect(mockedAuthApi.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: '김철수' })
      )
    })
  })

  it('AUTH_PASSWORD_MISMATCH 오류 시 "현재 비밀번호가 올바르지 않습니다." 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    mockedAuthApi.updateProfile.mockRejectedValue({
      code: 'AUTH_PASSWORD_MISMATCH',
      message: 'Password mismatch',
    })

    renderProfileForm()

    await user.type(screen.getByLabelText(/현재 비밀번호/i), 'wrongpassword')
    await user.type(screen.getByLabelText(/새 비밀번호/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /저장|수정|확인/i }))

    await waitFor(() => {
      expect(
        screen.getByText('현재 비밀번호가 올바르지 않습니다.')
      ).toBeInTheDocument()
    })
  })
})
