import React from 'react'
import type { Todo, TodoStatus } from '@/types'

const DOT_COLORS: Record<TodoStatus, string> = {
  DONE: 'var(--color-green)',
  IN_PROGRESS: 'var(--color-blue)',
  OVERDUE: 'var(--color-red)',
  NOT_STARTED: 'var(--color-gray)',
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function getTodosForDate(todos: Todo[], dateStr: string): Todo[] {
  return todos.filter((t) => t.endDate === dateStr)
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface CalendarGridProps {
  year: number
  month: number
  todos: Todo[]
  selectedDate: string | null
  today: string
  onDateSelect: (dateStr: string) => void
}

export function CalendarGrid({
  year,
  month,
  todos,
  selectedDate,
  today,
  onDateSelect,
}: CalendarGridProps) {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* 요일 헤더 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--separator)',
        }}
      >
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            style={{
              textAlign: 'center',
              padding: '8px 0',
              fontSize: '12px',
              color: i === 0 ? 'var(--color-red)' : i === 6 ? 'var(--color-blue)' : 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} style={{ minHeight: '64px' }} />
          }

          const dateStr = toDateStr(year, month, day)
          const dayTodos = getTodosForDate(todos, dateStr)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const visibleDots = dayTodos.slice(0, 3)
          const extraCount = dayTodos.length - 3

          return (
            <button
              key={dateStr}
              data-testid={`calendar-cell-${dateStr}`}
              onClick={() => onDateSelect(dateStr)}
              style={{
                minHeight: '64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 4px',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                minWidth: 'unset',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: isToday || isSelected ? 600 : 400,
                  color: isSelected
                    ? '#ffffff'
                    : isToday
                    ? 'var(--color-blue)'
                    : 'var(--text-primary)',
                  background: isSelected ? 'var(--color-blue)' : 'transparent',
                  border: isToday && !isSelected ? '2px solid var(--color-blue)' : 'none',
                  boxSizing: 'border-box',
                }}
              >
                {day}
              </div>

              {/* Dot indicators */}
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                {visibleDots.map((todo) => (
                  <div
                    key={todo.id}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: DOT_COLORS[todo.status],
                      flexShrink: 0,
                    }}
                  />
                ))}
                {extraCount > 0 && (
                  <span
                    style={{
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1,
                    }}
                  >
                    +{extraCount}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
