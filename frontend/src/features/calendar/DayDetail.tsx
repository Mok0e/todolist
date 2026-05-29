import React, { useEffect, useState } from 'react'
import { 
  parseISO, 
  startOfDay, 
  endOfDay,
  isSameDay
} from 'date-fns'
import { Check, Pencil, Trash2 } from 'lucide-react'
import type { Todo, TodoStatus } from '@/types'

const STATUS_COLOR: Record<TodoStatus, string> = {
  DONE: 'var(--text-tertiary)',
  IN_PROGRESS: 'var(--text-secondary)',
  OVERDUE: 'var(--color-red)',
  NOT_STARTED: 'var(--text-tertiary)',
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
  onToggleComplete: (todo: Todo) => void
  onDeleteTodo: (id: string) => void
}

export function DayDetail({ selectedDate, todos, isOpen, onClose, isDesktop, onEditTodo, onToggleComplete, onDeleteTodo }: DayDetailProps) {
  const dayTodos = selectedDate
    ? todos.filter((todo) => {
        const start = todo.startDate ? startOfDay(parseISO(todo.startDate)) : startOfDay(parseISO(todo.endDate))
        const end = endOfDay(parseISO(todo.endDate))
        const target = startOfDay(parseISO(selectedDate))
        
        return (target >= start && target <= end) || isSameDay(target, start) || isSameDay(target, end)
      })
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
        <TodoList todos={dayTodos} onEditTodo={onEditTodo} onToggleComplete={onToggleComplete} onDeleteTodo={onDeleteTodo} />
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
          <TodoList todos={dayTodos} onEditTodo={onEditTodo} onToggleComplete={onToggleComplete} onDeleteTodo={onDeleteTodo} />
        </div>
      </div>
    </>
  )
}

function TodoList({
  todos,
  onEditTodo,
  onToggleComplete,
  onDeleteTodo,
}: {
  todos: Todo[]
  onEditTodo: (todo: Todo) => void
  onToggleComplete: (todo: Todo) => void
  onDeleteTodo: (id: string) => void
}) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '0' }}>
            {/* 완료 토글 버튼 */}
            <button
              onClick={() => onToggleComplete(todo)}
              aria-label={todo.status === 'DONE' ? '완료 취소' : '완료'}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: todo.status === 'DONE' ? 'none' : '1px solid var(--separator-opaque)',
                background: todo.status === 'DONE' ? 'var(--color-green)' : 'transparent',
                flexShrink: 0,
                marginTop: '2px',
                cursor: 'pointer',
                padding: 0,
                minHeight: 'unset',
                minWidth: 'unset',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {todo.status === 'DONE' && <Check size={8} strokeWidth={1.5} color="white" />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '18px',
                    color: todo.status === 'DONE' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    textDecoration: todo.status === 'DONE' ? 'line-through' : 'none',
                    flex: 1,
                    minWidth: 0,
                    wordBreak: 'break-all',
                  }}
                >
                  {todo.title}
                </div>
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  <button
                    onClick={() => onEditTodo(todo)}
                    onMouseEnter={() => setHoveredButton(`edit-${todo.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: hoveredButton === `edit-${todo.id}` ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'color 150ms ease',
                    }}
                    aria-label="수정"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    onMouseEnter={() => setHoveredButton(`delete-${todo.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: hoveredButton === `delete-${todo.id}` ? 'var(--color-red)' : 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'color 150ms ease',
                    }}
                    aria-label="삭제"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: STATUS_COLOR[todo.status],
                    fontWeight: 500,
                  }}
                >
                  {STATUS_LABEL[todo.status]}
                </span>
                {todo.category?.name && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {todo.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          {idx < todos.length - 1 && (
            <div style={{ height: '1px', background: 'var(--separator)', marginLeft: '22px' }} />
          )}
        </div>
      ))}
    </div>
  )
}
