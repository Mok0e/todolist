import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { Button } from './Button'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Button', () => {
  it('children이 렌더링된다', () => {
    render(<Button>저장</Button>)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('loading=true 시 버튼이 disabled 상태다', () => {
    render(<Button loading>저장</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('loading=true 시 로딩 텍스트가 표시된다', () => {
    render(<Button loading>저장</Button>)
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  it('disabled prop이 전달되면 버튼이 disabled 상태다', () => {
    render(<Button disabled>저장</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('onClick 핸들러가 호출된다', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>클릭</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서는 onClick 핸들러가 호출되지 않는다', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>클릭</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
