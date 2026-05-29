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
    background: 'var(--bg-grouped)',
    padding: 'var(--spacing-md)',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--separator)',
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
