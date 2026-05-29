import React from 'react'

export interface SegmentedControlProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-full)',
    padding: '2px',
    gap: '2px',
    overflowX: 'auto',
    scrollbarWidth: 'none' as const,
    flexWrap: 'nowrap',
  }

  return (
    <div style={containerStyle} role="group">
      {options.map((option) => {
        const isActive = option.value === value
        const buttonStyle: React.CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '32px',
          padding: '0 14px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: isActive ? 'var(--bg-elevated)' : 'transparent',
          boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: isActive ? 600 : 400,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 200ms ease, color 200ms ease, box-shadow 200ms ease',
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
