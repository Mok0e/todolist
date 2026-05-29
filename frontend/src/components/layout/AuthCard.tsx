import React from 'react'

export interface AuthCardProps {
  children: React.ReactNode
  title?: string
}

export function AuthCard({ children, title }: AuthCardProps) {
  const outerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: 'var(--spacing-md)',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-xl)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textAlign: 'center',
    marginBottom: '32px',
    fontFamily: 'var(--font-display)',
  }

  return (
    <div style={outerStyle}>
      <div style={cardStyle}>
        {title && <h1 style={titleStyle}>{title}</h1>}
        {children}
      </div>
    </div>
  )
}
