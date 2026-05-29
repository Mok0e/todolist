import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { FloatingLabelInput } from './FloatingLabelInput'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FloatingLabelInput', () => {
  it('label prop이 렌더링된다', () => {
    render(<FloatingLabelInput label="이메일" />)
    expect(screen.getByText('이메일')).toBeInTheDocument()
  })

  it('type="text"일 때 눈 아이콘이 없다', () => {
    render(<FloatingLabelInput label="이름" type="text" />)
    expect(screen.queryByRole('button', { name: /비밀번호/i })).not.toBeInTheDocument()
    expect(document.querySelector('[data-testid="toggle-password"]')).not.toBeInTheDocument()
  })

  it('type="password"일 때 눈 아이콘이 있다', () => {
    render(<FloatingLabelInput label="비밀번호" type="password" />)
    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeInTheDocument()
  })

  it('눈 아이콘 클릭 시 input type이 password에서 text로 토글된다', async () => {
    const user = userEvent.setup()
    render(<FloatingLabelInput label="비밀번호" type="password" />)

    const input = screen.getByLabelText('비밀번호')
    expect(input).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button')
    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('error prop이 있을 때 오류 메시지가 렌더링된다', () => {
    render(<FloatingLabelInput label="이메일" error="올바른 이메일을 입력하세요." />)
    expect(screen.getByText('올바른 이메일을 입력하세요.')).toBeInTheDocument()
  })

  it('error prop이 없을 때 오류 메시지가 없다', () => {
    render(<FloatingLabelInput label="이메일" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('hint prop이 렌더링된다', () => {
    render(<FloatingLabelInput label="비밀번호" hint="8자 이상 영문+숫자 조합" />)
    expect(screen.getByText('8자 이상 영문+숫자 조합')).toBeInTheDocument()
  })
})
