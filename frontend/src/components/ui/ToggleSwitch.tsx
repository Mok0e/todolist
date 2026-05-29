import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  ariaLabel?: string
}

export function ToggleSwitch({ checked, onChange, disabled = false, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '32px',
        height: '20px',
        minWidth: '32px',
        minHeight: '20px',
        borderRadius: 'var(--radius-full)',
        background: checked ? 'var(--color-blue)' : 'var(--color-gray3)',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 200ms ease-in-out',
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '14px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: 'var(--radius-full)',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          transition: 'left 200ms ease-in-out',
          pointerEvents: 'none',
        }}
      />
    </button>
  )
}
