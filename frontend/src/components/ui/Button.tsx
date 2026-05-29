import React, { useState } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'tint' | 'destructive'
  fullWidth?: boolean
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const isDisabled = loading || disabled

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-text)',
    fontWeight: 600,
    fontSize: '17px',
    borderRadius: 'var(--radius-full)',
    transition: 'opacity 200ms ease, transform 150ms ease, box-shadow 200ms ease',
    opacity: isDisabled ? 0.4 : 1,
    width: fullWidth ? '100%' : undefined,
  }

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          height: '50px',
          background: 'var(--color-blue)',
          color: '#ffffff',
          padding: '0 24px',
        }
      : variant === 'tint'
        ? {
            height: '44px',
            background: 'transparent',
            color: 'var(--text-tint)',
            padding: '0 16px',
          }
        : {
            height: '44px',
            background: 'transparent',
            color: 'var(--color-red)',
            padding: '0 16px',
          }

  const getInteractionStyle = (): React.CSSProperties => {
    if (isDisabled) return {}
    if (isPressed) return { transform: 'scale(0.97)', opacity: 0.9 }
    if (isHovered) {
      if (variant === 'primary') return { transform: 'scale(1.01)', boxShadow: '0 4px 16px rgba(0, 113, 227, 0.35)' }
      return { opacity: 0.8 }
    }
    return {}
  }

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{ ...baseStyle, ...variantStyle, ...getInteractionStyle(), ...style }}
    >
      {loading ? '로딩 중...' : children}
    </button>
  )
}
