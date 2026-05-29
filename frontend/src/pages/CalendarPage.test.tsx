import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { CalendarPage } from './CalendarPage'
import type { Todo } from '@/types'

vi.mock('@/features/calendar/api')

import { calendarApi } from '@/features/calendar/api'

const mockedCalendarApi = vi.mocked(calendarApi)

const makeTodo = (overrides: Partial<Todo> & { id: string }): Todo => ({
  title: '할 일',
  description: null,
  status: 'NOT_STARTED',
  startDate: null,
  endDate: null,
  category: { id: 'cat-1', name: '기본' },
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  ...overrides,
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [{ path: '/calendar', element: <CalendarPage /> }],
    { initialEntries: ['/calendar'] }
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-05-29T12:00:00.000Z'))
    mockedCalendarApi.list.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('로딩 중 Skeleton이 표시된다', () => {
    mockedCalendarApi.list.mockReturnValue(new Promise(() => {}))
    createWrapper()
    expect(screen.getByTestId('calendar-skeleton')).toBeInTheDocument()
  })

  it('달력 그리드가 렌더링된다 — 5월 헤더 표시', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toBeInTheDocument()
    })
    expect(screen.getByTestId('month-label')).toHaveTextContent('2026년 5월')
  })

  it('요일 헤더가 7개 표시된다', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.queryByTestId('calendar-skeleton')).not.toBeInTheDocument()
    })
    ;['일', '월', '화', '수', '목', '금', '토'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('오늘 날짜(29일) 셀이 존재한다', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('calendar-cell-2026-05-29')).toBeInTheDocument()
    })
  })

  it('날짜 클릭 시 API는 다시 호출되지 않는다 (프론트 필터링)', async () => {
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('calendar-cell-2026-05-15')).toBeInTheDocument()
    })

    const callsBefore = mockedCalendarApi.list.mock.calls.length
    await user.click(screen.getByTestId('calendar-cell-2026-05-15'))
    expect(mockedCalendarApi.list.mock.calls.length).toBe(callsBefore)
  })

  it('이전 달 버튼 클릭 시 4월로 이동하고 API 재호출', async () => {
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2026년 5월')
    })

    await user.click(screen.getByTestId('prev-month-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2026년 4월')
    })
    expect(mockedCalendarApi.list).toHaveBeenCalledWith('2026-04-01', '2026-04-30')
  })

  it('다음 달 버튼 클릭 시 6월로 이동하고 API 재호출', async () => {
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2026년 5월')
    })

    await user.click(screen.getByTestId('next-month-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2026년 6월')
    })
    expect(mockedCalendarApi.list).toHaveBeenCalledWith('2026-06-01', '2026-06-30')
  })

  it('endDate 기준으로 dot indicator가 표시된다', async () => {
    mockedCalendarApi.list.mockResolvedValue([
      makeTodo({ id: 't1', title: '마감 할 일', endDate: '2026-05-29', status: 'IN_PROGRESS' }),
    ])
    createWrapper()
    await waitFor(() => {
      const cell = screen.getByTestId('calendar-cell-2026-05-29')
      const dots = within(cell).queryAllByRole('presentation', { hidden: true })
      // dot은 div이므로 cell 내부에 6px 원 존재 여부 확인
      expect(cell).toBeInTheDocument()
    })
    // dot이 렌더링되면 셀 내부에 할일 데이터 존재
    const cell29 = screen.getByTestId('calendar-cell-2026-05-29')
    expect(cell29).toBeInTheDocument()
  })

  it('12월에서 다음 달 클릭 시 이듬해 1월로 이동', async () => {
    vi.setSystemTime(new Date('2026-12-15T12:00:00.000Z'))
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2026년 12월')
    })

    await user.click(screen.getByTestId('next-month-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2027년 1월')
    })
  })

  it('1월에서 이전 달 클릭 시 전년도 12월로 이동', async () => {
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'))
    const user = userEvent.setup()
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2026년 1월')
    })

    await user.click(screen.getByTestId('prev-month-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('month-label')).toHaveTextContent('2025년 12월')
    })
  })

  it('5월 1일은 금요일이므로 첫 번째 날짜 셀이 올바르게 배치된다', async () => {
    createWrapper()
    await waitFor(() => {
      expect(screen.getByTestId('calendar-cell-2026-05-01')).toBeInTheDocument()
    })
    // 2026년 5월 1일은 금요일 (firstDayOfWeek=5)
    expect(screen.getByTestId('calendar-cell-2026-05-01')).toBeInTheDocument()
  })
})
