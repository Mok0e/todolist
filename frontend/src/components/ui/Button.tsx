import React from 'react'

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
    transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
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

  return (
    <button
      {...rest}
      disabled={isDisabled}
      style={{ ...baseStyle, ...variantStyle, ...style }}
    >
      {loading ? '로딩 중...' : children}
    </button>
  )
}
