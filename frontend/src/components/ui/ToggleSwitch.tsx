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
        width: '44px',
        height: '24px',
        minWidth: '44px',
        minHeight: '24px',
        borderRadius: '24px',
        background: checked ? '#34C759' : 'rgba(120, 120, 128, 0.16)',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      />
    </button>
  )
}
