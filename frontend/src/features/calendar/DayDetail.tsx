import React, { useEffect } from 'react'
import type { Todo, TodoStatus } from '@/types'

const STATUS_COLOR: Record<TodoStatus, string> = {
  DONE: 'var(--color-green)',
  IN_PROGRESS: 'var(--color-blue)',
  OVERDUE: 'var(--color-red)',
  NOT_STARTED: 'var(--color-gray)',
}

const STATUS_LABEL: Record<TodoStatus, string> = {
  DONE: '완료',
  IN_PROGRESS: '진행중',
  OVERDUE: '기한초과',
  NOT_STARTED: '시작전',
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`
}

interface DayDetailProps {
  selectedDate: string | null
  todos: Todo[]
  isOpen: boolean
  onClose: () => void
  isDesktop: boolean
  onEditTodo: (todo: Todo) => void
}

export function DayDetail({ selectedDate, todos, isOpen, onClose, isDesktop, onEditTodo }: DayDetailProps) {
  const dayTodos = selectedDate
    ? todos.filter((t) => t.endDate === selectedDate)
    : []

  const title = selectedDate
    ? `${formatDateLabel(selectedDate)} — 할 일 ${dayTodos.length}개`
    : ''

  useEffect(() => {
    if (!isDesktop && isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDesktop, isOpen, onClose])

  if (isDesktop) {
    if (!selectedDate) return null
    return (
      <div
        data-testid="day-detail-panel"
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          minHeight: '200px',
        }}
      >
        <div
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}
        >
          {title}
        </div>
        <TodoList todos={dayTodos} onEditTodo={onEditTodo} />
      </div>
    )
  }

  // Mobile: Bottom Sheet
  return (
    <>
      {isOpen && (
        <div
          data-testid="bottom-sheet-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}
      <div
        data-testid="day-detail-sheet"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          zIndex: 50,
          paddingBottom: '60px',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Grabber handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '8px 0 4px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-gray)',
              opacity: 0.4,
            }}
          />
        </div>

        <div style={{ padding: '12px 20px 20px' }}>
          <div
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            {title}
          </div>
          <TodoList todos={dayTodos} onEditTodo={onEditTodo} />
        </div>
      </div>
    </>
  )
}

function TodoList({ todos, onEditTodo }: { todos: Todo[]; onEditTodo: (todo: Todo) => void }) {
  if (todos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '32px 0',
          color: 'var(--text-secondary)',
          fontSize: '16px',
        }}
      >
        <span style={{ fontSize: '32px' }}>📅</span>
        이 날의 할 일이 없습니다.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {todos.map((todo, idx) => (
        <div key={todo.id}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${STATUS_COLOR[todo.status]}`,
                background: todo.status === 'DONE' ? STATUS_COLOR[todo.status] : 'transparent',
                flexShrink: 0,
                marginTop: '1px',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    textDecoration: todo.status === 'DONE' ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {todo.title}
                </div>
                <button
                  onClick={() => onEditTodo(todo)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-blue)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '0',
                    minHeight: 'unset',
                    minWidth: 'unset',
                    flexShrink: 0,
                  }}
                >
                  수정
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    color: STATUS_COLOR[todo.status],
                    fontWeight: 500,
                  }}
                >
                  {STATUS_LABEL[todo.status]}
                </span>
                {todo.category?.name && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {todo.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          {idx < todos.length - 1 && (
            <div style={{ height: '1px', background: 'var(--separator)', marginLeft: '32px' }} />
          )}
        </div>
      ))}
    </div>
  )
}
