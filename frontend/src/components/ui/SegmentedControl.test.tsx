import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'ALL', label: '전체' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'DONE', label: '완료' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SegmentedControl', () => {
  it('모든 옵션이 렌더링된다', () => {
    render(<SegmentedControl options={options} value="ALL" onChange={vi.fn()} />)
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('진행중')).toBeInTheDocument()
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('현재 선택된 value의 옵션이 active 상태다', () => {
    render(<SegmentedControl options={options} value="IN_PROGRESS" onChange={vi.fn()} />)
    const activeButton = screen.getByText('진행중').closest('button') ?? screen.getByText('진행중')
    expect(activeButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('선택되지 않은 옵션은 active 상태가 아니다', () => {
    render(<SegmentedControl options={options} value="IN_PROGRESS" onChange={vi.fn()} />)
    const inactiveButton = screen.getByText('전체').closest('button') ?? screen.getByText('전체')
    expect(inactiveButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('다른 옵션 클릭 시 onChange가 호출된다', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<SegmentedControl options={options} value="ALL" onChange={handleChange} />)
    await user.click(screen.getByText('진행중'))
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('onChange에 클릭한 value가 전달된다', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<SegmentedControl options={options} value="ALL" onChange={handleChange} />)
    await user.click(screen.getByText('완료'))
    expect(handleChange).toHaveBeenCalledWith('DONE')
  })
})
