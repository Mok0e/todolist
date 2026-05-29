import React from 'react'

export interface SegmentedControlProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    gap: 'var(--spacing-xs)',
    scrollbarWidth: 'none',
  }

  return (
    <div style={containerStyle} role="group">
      {options.map((option) => {
        const isActive = option.value === value
        const buttonStyle: React.CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '36px',
          padding: '0 16px',
          borderRadius: 'var(--radius-full)',
          border: isActive ? 'none' : '1.5px solid var(--separator)',
          background: isActive ? 'var(--text-primary)' : 'transparent',
          color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
          fontSize: '15px',
          fontWeight: isActive ? 600 : 400,
          fontFamily: 'var(--font-text)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 200ms ease, color 200ms ease',
          flexShrink: 0,
        }

        return (
          <button
            key={option.value}
            type="button"
            style={buttonStyle}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
