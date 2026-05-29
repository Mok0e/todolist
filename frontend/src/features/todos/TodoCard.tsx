import React, { useState } from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'
import { StatusBadge } from './StatusBadge'

export interface TodoCardProps {
  todo: Todo
  onComplete: (id: string) => void
  onIncomplete: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export function TodoCard({ todo, onComplete, onIncomplete, onEdit, onDelete }: TodoCardProps) {
  const isDone = todo.status === 'DONE'
  const [isHovered, setIsHovered] = useState(false)

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    transition: 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 200ms ease',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    border: '1px solid var(--separator)',
    cursor: 'default',
  }

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  }

  const checkButtonStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    borderRadius: 'var(--radius-full)',
    border: isDone ? 'none' : '2px solid var(--color-gray)',
    background: isDone ? 'var(--color-green)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    color: '#ffffff',
  }

  const titleStyle: React.CSSProperties = {
    flex: 1,
    fontSize: '17px',
    fontWeight: 500,
    color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
    textDecoration: isDone ? 'line-through' : 'none',
    margin: 0,
  }

  const categoryStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    flexShrink: 0,
  }

  const bottomRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const leftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  }

  const dateStyle: React.CSSProperties = {
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
  }

  const actionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  }

  const iconButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  }

  const dateText = (() => {
    if (todo.startDate && todo.endDate) {
      return `${todo.startDate} ~ ${todo.endDate}`
    }
    if (todo.endDate) {
      return `~ ${todo.endDate}`
    }
    return null
  })()

  return (
    <div style={cardStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div style={topRowStyle}>
        <button
          type="button"
          style={checkButtonStyle}
          aria-label={isDone ? '완료 취소' : '완료로 표시'}
          onClick={() => (isDone ? onIncomplete(todo.id) : onComplete(todo.id))}
        >
          {isDone && <Check size={14} strokeWidth={3} />}
        </button>
        <p style={titleStyle}>{todo.title}</p>
        <span style={categoryStyle}>{todo.category.name}</span>
      </div>
      <div style={bottomRowStyle}>
        <div style={leftStyle}>
          <StatusBadge status={todo.status} />
          {dateText && <span style={dateStyle}>{dateText}</span>}
        </div>
        <div style={actionStyle}>
          <button
            type="button"
            style={{ ...iconButtonStyle, color: 'var(--text-secondary)' }}
            aria-label="수정"
            onClick={() => onEdit(todo)}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            style={{ ...iconButtonStyle, color: 'var(--color-red)' }}
            aria-label="삭제"
            onClick={() => onDelete(todo.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
