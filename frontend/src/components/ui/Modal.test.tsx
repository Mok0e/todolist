import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { Modal } from './Modal'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Modal', () => {
  it('isOpen=false 시 콘텐츠가 렌더링되지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="모달 제목">
        <p>모달 내용</p>
      </Modal>
    )
    expect(screen.queryByText('모달 제목')).not.toBeInTheDocument()
    expect(screen.queryByText('모달 내용')).not.toBeInTheDocument()
  })

  it('isOpen=true 시 title이 렌더링된다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="모달 제목">
        <p>모달 내용</p>
      </Modal>
    )
    expect(screen.getByText('모달 제목')).toBeInTheDocument()
  })

  it('isOpen=true 시 children이 렌더링된다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="모달 제목">
        <p>모달 내용</p>
      </Modal>
    )
    expect(screen.getByText('모달 내용')).toBeInTheDocument()
  })

  it('오버레이 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="모달 제목">
        <p>모달 내용</p>
      </Modal>
    )
    const overlay = screen.getByTestId('modal-overlay')
    await user.click(overlay)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('title prop이 없어도 오류 없이 렌더링된다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>모달 내용</p>
      </Modal>
    )
    expect(screen.getByText('모달 내용')).toBeInTheDocument()
  })
})
