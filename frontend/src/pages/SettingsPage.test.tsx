import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { SettingsPage } from './SettingsPage'
import type { User } from '@/types'

vi.mock('@/features/auth/api')
vi.mock('@/features/settings/api')
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}))

import { authApi } from '@/features/auth/api'
import { settingsApi } from '@/features/settings/api'
import { useTranslation } from 'react-i18next'

const mockedAuthApi = vi.mocked(authApi)
const mockedSettingsApi = vi.mocked(settingsApi)
const mockedUseTranslation = vi.mocked(useTranslation)

const translations: Record<string, string> = {
  'settings.title': '설정',
  'settings.theme': '테마',
  'settings.language': '언어',
  'settings.themeLight': '라이트 모드',
  'settings.themeDark': '다크 모드',
  'settings.langKo': '한국어',
  'settings.langEn': 'English',
}

const mockChangeLanguage = vi.fn().mockResolvedValue(undefined)

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: '테스터',
  theme: 'LIGHT',
  language: 'ko',
  createdAt: '2026-05-29T00:00:00.000Z',
  updatedAt: '2026-05-29T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [{ path: '/settings', element: <SettingsPage /> }],
    { initialEntries: ['/settings'] }
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedAuthApi.getMe.mockResolvedValue(mockUser)
  mockedSettingsApi.update.mockResolvedValue({ theme: 'LIGHT', language: 'ko' })
  mockedUseTranslation.mockReturnValue({
    t: (key: string) => translations[key] ?? key,
    i18n: { language: 'ko', changeLanguage: mockChangeLanguage },
  } as unknown as ReturnType<typeof useTranslation>)
})

describe('SettingsPage', () => {
  it('로딩 중 Skeleton이 표시된다', () => {
    mockedAuthApi.getMe.mockReturnValue(new Promise(() => {}))
    createWrapper()
    expect(screen.getByTestId('settings-skeleton')).toBeInTheDocument()
  })

  it('설정 항목이 렌더링된다', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.getByText('설정')).toBeInTheDocument()
      expect(screen.getByText('테마')).toBeInTheDocument()
      expect(screen.getByText('언어')).toBeInTheDocument()
    })
  })

  it('LIGHT 테마일 때 토글이 꺼진 상태다', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: '테마' })).toBeInTheDocument()
    })
    expect(screen.getByRole('switch', { name: '테마' })).toHaveAttribute('aria-checked', 'false')
  })

  it('DARK 테마일 때 토글이 켜진 상태다', async () => {
    mockedAuthApi.getMe.mockResolvedValue({ ...mockUser, theme: 'DARK' })
    createWrapper()
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: '테마' })).toBeInTheDocument()
    })
    expect(screen.getByRole('switch', { name: '테마' })).toHaveAttribute('aria-checked', 'true')
  })

  it('테마 토글 클릭 시 settingsApi.update가 호출된다', async () => {
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: '테마' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('switch', { name: '테마' }))

    await waitFor(() => {
      expect(mockedSettingsApi.update.mock.calls[0]?.[0]).toEqual({ theme: 'DARK' })
    })
  })

  it('언어 변경 시 settingsApi.update와 i18n.changeLanguage가 호출된다', async () => {
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'English' }))

    await waitFor(() => {
      expect(mockedSettingsApi.update.mock.calls[0]?.[0]).toEqual({ language: 'en' })
    })
    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
  })

  it('테마 변경 시 document에 data-theme 속성이 즉시 설정된다', async () => {
    const user = userEvent.setup()
    mockedSettingsApi.update.mockReturnValue(new Promise(() => {}))
    createWrapper()
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: '테마' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('switch', { name: '테마' }))

    expect(document.documentElement.getAttribute('data-theme')).toBe('DARK')
  })

  it('API 오류 시 이전 설정으로 롤백된다', async () => {
    const user = userEvent.setup()
    mockedSettingsApi.update.mockRejectedValue(new Error('서버 오류'))
    createWrapper()
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: '테마' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('switch', { name: '테마' }))

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('LIGHT')
    })
  })
})
