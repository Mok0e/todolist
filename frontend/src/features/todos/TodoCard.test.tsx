import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { TodoCard } from './TodoCard'
import type { Todo } from '@/types'

const mockTodo: Todo = {
  id: '1',
  title: 'API 명세서 검토',
  description: '설명',
  status: 'IN_PROGRESS',
  startDate: '2026-05-27',
  endDate: '2026-05-29',
  category: { id: 'cat1', name: '업무' },
  createdAt: '2026-05-27T00:00:00.000Z',
  updatedAt: '2026-05-27T00:00:00.000Z',
}

function renderCard(todo: Todo, overrides?: Partial<Parameters<typeof TodoCard>[0]>) {
  const props = {
    todo,
    onComplete: vi.fn(),
    onIncomplete: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
  return { ...render(<TodoCard {...props} />), props }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TodoCard', () => {
  it('todo.title이 렌더링된다', () => {
    renderCard(mockTodo)
    expect(screen.getByText('API 명세서 검토')).toBeInTheDocument()
  })

  it('NOT_STARTED 상태의 배지 텍스트가 렌더링된다', () => {
    renderCard({ ...mockTodo, status: 'NOT_STARTED' })
    expect(screen.getByText('시작전')).toBeInTheDocument()
  })

  it('IN_PROGRESS 상태의 배지 텍스트가 렌더링된다', () => {
    renderCard({ ...mockTodo, status: 'IN_PROGRESS' })
    expect(screen.getByText('진행중')).toBeInTheDocument()
  })

  it('OVERDUE 상태의 배지 텍스트가 렌더링된다', () => {
    renderCard({ ...mockTodo, status: 'OVERDUE' })
    expect(screen.getByText('기한초과')).toBeInTheDocument()
  })

  it('DONE 상태의 배지 텍스트가 렌더링된다', () => {
    renderCard({ ...mockTodo, status: 'DONE' })
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('todo.category.name이 렌더링된다', () => {
    renderCard(mockTodo)
    expect(screen.getByText('업무')).toBeInTheDocument()
  })

  it('DONE이 아닌 할 일: 완료 버튼 클릭 시 onComplete(todo.id)가 호출된다', async () => {
    const user = userEvent.setup()
    const { props } = renderCard({ ...mockTodo, status: 'IN_PROGRESS' })
    await user.click(screen.getByRole('button', { name: /완료/i }))
    expect(props.onComplete).toHaveBeenCalledWith('1')
  })

  it('DONE인 할 일: 완료 취소 버튼 클릭 시 onIncomplete(todo.id)가 호출된다', async () => {
    const user = userEvent.setup()
    const { props } = renderCard({ ...mockTodo, status: 'DONE' })
    await user.click(screen.getByRole('button', { name: /완료 취소/i }))
    expect(props.onIncomplete).toHaveBeenCalledWith('1')
  })

  it('수정 버튼 클릭 시 onEdit(todo)가 호출된다', async () => {
    const user = userEvent.setup()
    const { props } = renderCard(mockTodo)
    await user.click(screen.getByRole('button', { name: /수정/i }))
    expect(props.onEdit).toHaveBeenCalledWith(mockTodo)
  })

  it('삭제 버튼 클릭 시 onDelete(todo.id)가 호출된다', async () => {
    const user = userEvent.setup()
    const { props } = renderCard(mockTodo)
    await user.click(screen.getByRole('button', { name: /삭제/i }))
    expect(props.onDelete).toHaveBeenCalledWith('1')
  })

  it('startDate, endDate가 있으면 날짜가 표시된다', () => {
    renderCard({ ...mockTodo, startDate: '2026-05-27', endDate: '2026-05-29' })
    expect(screen.getByText(/2026-05-27/)).toBeInTheDocument()
    expect(screen.getByText(/2026-05-29/)).toBeInTheDocument()
  })

  it('DONE 상태이면 취소선 스타일이 적용된다', () => {
    renderCard({ ...mockTodo, status: 'DONE' })
    const title = screen.getByText('API 명세서 검토')
    expect(title).toHaveStyle({ textDecoration: 'line-through' })
  })
})
