import React, { useState } from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'

const STATUS_LABEL: Record<Todo['status'], string> = {
  NOT_STARTED: '시작전',
  IN_PROGRESS: '진행중',
  OVERDUE: '기한초과',
  DONE: '완료',
}

const STATUS_COLOR: Record<Todo['status'], string> = {
  NOT_STARTED: 'var(--text-tertiary)',
  IN_PROGRESS: 'var(--text-secondary)',
  OVERDUE: 'var(--color-red)',
  DONE: 'var(--text-tertiary)',
}

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
  const [isEditHovered, setIsEditHovered] = useState(false)
  const [isDeleteHovered, setIsDeleteHovered] = useState(false)

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    padding: '14px 16px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--separator)',
    boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-md)',
    transition: 'box-shadow 200ms ease',
    cursor: 'default',
  }

  const checkButtonStyle: React.CSSProperties = {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    marginTop: '2px',
    background: isDone ? 'var(--check-green)' : 'transparent',
    border: isDone ? 'none' : '2px solid var(--separator-opaque)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 200ms ease',
  }

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 500,
    lineHeight: 1.4,
    color: isDone ? 'var(--text-tertiary)' : 'var(--text-primary)',
    textDecoration: isDone ? 'line-through' : 'none',
    margin: 0,
  }

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '5px',
  }

  const metaTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
  }

  const dotStyle: React.CSSProperties = {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    opacity: 0.5,
  }

  const actionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  }

  const dateText = (() => {
    if (todo.startDate && todo.endDate && todo.startDate !== todo.endDate) {
      return `${todo.startDate} ~ ${todo.endDate}`
    }
    if (todo.endDate) {
      return todo.endDate
    }
    return null
  })()

  return (
    <div style={cardStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button
        type="button"
        style={checkButtonStyle}
        aria-label={isDone ? '완료 취소' : '완료로 표시'}
        onClick={() => (isDone ? onIncomplete(todo.id) : onComplete(todo.id))}
      >
        {isDone && <Check size={14} strokeWidth={3.5} color="white" />}
      </button>

      <div style={contentStyle}>
        <p style={titleStyle}>{todo.title}</p>
        <div style={metaStyle}>
          <span style={metaTextStyle}>{todo.category.name}</span>
          <span style={dotStyle}>·</span>
          <span style={{ ...metaTextStyle, color: STATUS_COLOR[todo.status] }}>
            {STATUS_LABEL[todo.status]}
          </span>
          {dateText && (
            <>
              <span style={dotStyle}>·</span>
              <span style={metaTextStyle}>{dateText}</span>
            </>
          )}
        </div>
      </div>

      <div style={actionStyle}>
        <button
          type="button"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            color: isEditHovered ? 'var(--text-secondary)' : 'var(--text-tertiary)',
          }}
          aria-label="수정"
          onClick={() => onEdit(todo)}
          onMouseEnter={() => setIsEditHovered(true)}
          onMouseLeave={() => setIsEditHovered(false)}
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            color: isDeleteHovered ? 'var(--color-red)' : 'var(--text-tertiary)',
          }}
          aria-label="삭제"
          onClick={() => onDelete(todo.id)}
          onMouseEnter={() => setIsDeleteHovered(true)}
          onMouseLeave={() => setIsDeleteHovered(false)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
