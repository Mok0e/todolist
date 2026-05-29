import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EmptyState', () => {
  it('title이 렌더링된다', () => {
    render(<EmptyState title="할 일이 없습니다" />)
    expect(screen.getByText('할 일이 없습니다')).toBeInTheDocument()
  })

  it('description이 있으면 렌더링된다', () => {
    render(<EmptyState title="할 일이 없습니다" description="새 할 일을 추가해보세요" />)
    expect(screen.getByText('새 할 일을 추가해보세요')).toBeInTheDocument()
  })

  it('description이 없으면 렌더링되지 않는다', () => {
    render(<EmptyState title="할 일이 없습니다" />)
    expect(screen.queryByText('새 할 일을 추가해보세요')).not.toBeInTheDocument()
  })

  it('action.label이 있으면 버튼이 렌더링된다', () => {
    render(
      <EmptyState
        title="할 일이 없습니다"
        action={{ label: '할 일 추가', onClick: vi.fn() }}
      />
    )
    expect(screen.getByRole('button', { name: '할 일 추가' })).toBeInTheDocument()
  })

  it('action이 없으면 버튼이 렌더링되지 않는다', () => {
    render(<EmptyState title="할 일이 없습니다" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('버튼 클릭 시 action.onClick이 호출된다', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <EmptyState
        title="할 일이 없습니다"
        action={{ label: '할 일 추가', onClick: handleClick }}
      />
    )
    await user.click(screen.getByRole('button', { name: '할 일 추가' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
