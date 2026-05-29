import React from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--overlay-dim)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'var(--spacing-md)',
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-xl)',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: title ? 'var(--spacing-lg)' : 0,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  }

  const closeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    flexShrink: 0,
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div style={overlayStyle} data-testid="modal-overlay" onClick={handleOverlayClick}>
      <div style={cardStyle} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          {title && <h2 style={titleStyle}>{title}</h2>}
          <button style={closeButtonStyle} onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
