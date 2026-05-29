import React from 'react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    gap: 'var(--spacing-md)',
    textAlign: 'center',
  }

  const iconWrapperStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: '17px',
    color: 'var(--text-secondary)',
    margin: 0,
  }

  return (
    <div style={containerStyle}>
      {icon && <div style={iconWrapperStyle}>{icon}</div>}
      <p style={titleStyle}>{title}</p>
      {description && <p style={descriptionStyle}>{description}</p>}
      {action && (
        <Button variant="tint" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
