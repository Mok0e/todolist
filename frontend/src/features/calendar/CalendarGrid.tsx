import { useState } from 'react'
import {
  parseISO,
  isSameDay,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
  isBefore,
  isAfter,
  addDays,
  startOfWeek,
  endOfWeek,
  differenceInDays
} from 'date-fns'
import type { Todo, TodoStatus } from '@/types'

const STATUS_COLOR: Record<TodoStatus, string> = {
  DONE: 'var(--bar-green)',
  IN_PROGRESS: 'var(--bar-blue)',
  OVERDUE: 'var(--bar-red)',
  NOT_STARTED: 'var(--bar-gray)',
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarGridProps {
  year: number
  month: number
  todos: Todo[]
  selectedDate: string | null
  today: string
  onDateSelect: (dateStr: string) => void
  onMoveTodo?: (todoId: string, newStartDate: string | null, newEndDate: string) => void
}

export function CalendarGrid({
  year,
  month,
  todos,
  selectedDate,
  today,
  onDateSelect,
  onMoveTodo,
}: CalendarGridProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // Group todos by rows (weeks) and assign vertical slots
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  calendarDays.forEach((day) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--separator)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
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
              padding: '12px 0',
              fontSize: '13px',
              color: i === 0 ? 'var(--color-red)' : i === 6 ? 'var(--color-blue)' : 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 주 단위 렌더링 */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} style={{ position: 'relative', borderBottom: weekIdx === weeks.length - 1 ? 'none' : '1px solid var(--separator)' }}>
          {/* 날짜 숫자 레이어 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '120px' }}>
            {week.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const isCurrentMonth = day.getMonth() === month - 1
              const hovered = hoveredDate === dateStr

              return (
                <div
                  key={dateStr}
                  data-testid={`calendar-cell-${dateStr}`}
                  onClick={() => onDateSelect(dateStr)}
                  onMouseEnter={() => setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const todoId = e.dataTransfer.getData('todo-id')
                    const origStart = e.dataTransfer.getData('todo-startDate') || null
                    const origEnd = e.dataTransfer.getData('todo-endDate')
                    if (!todoId || !origEnd || !onMoveTodo) return
                    const diffDays = origStart
                      ? differenceInDays(parseISO(origEnd), parseISO(origStart))
                      : 0
                    const newEnd = dateStr
                    const newStart = origStart
                      ? format(addDays(parseISO(dateStr), -diffDays), 'yyyy-MM-dd')
                      : null
                    onMoveTodo(todoId, newStart, newEnd)
                  }}
                  style={{
                    padding: '8px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Hover/Selection Background */}
                  {!isSelected && !isToday && hovered && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      zIndex: 0
                    }} />
                  )}

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      zIndex: 1,
                      fontWeight: isToday || isSelected ? 600 : 500,
                      color: isSelected
                        ? '#ffffff'
                        : isToday
                        ? 'var(--color-blue)'
                        : isCurrentMonth ? 'var(--text-primary)' : 'var(--text-placeholder)',
                      background: isSelected ? 'var(--color-blue)' : 'transparent',
                      border: isToday && !isSelected ? '1px solid var(--color-blue)' : 'none',
                      boxSizing: 'border-box',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 할 일 바(Bar) 레이어 */}
          <div style={{ 
            position: 'absolute', 
            top: '48px', 
            left: 0, 
            right: 0, 
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {getWeekBars(todos, week).map((bar, barIdx) => {
              if (barIdx >= 3) return null // 최대 3개까지만 표시 (디자인상)
              
              return (
                <div key={`${bar.todo.id}-${barIdx}`} style={{ height: '18px', position: 'relative' }}>
                  <div
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('todo-id', bar.todo.id)
                      e.dataTransfer.setData('todo-startDate', bar.todo.startDate ?? '')
                      e.dataTransfer.setData('todo-endDate', bar.todo.endDate ?? '')
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    style={{
                      position: 'absolute',
                      left: `${(bar.startCol * 100) / 7}%`,
                      width: `${(bar.span * 100) / 7}%`,
                      height: '100%',
                      padding: '0 4px',
                      boxSizing: 'border-box',
                      cursor: 'grab',
                      pointerEvents: 'auto'
                    }}
                  >
                    <div
                      style={{
                        background: STATUS_COLOR[bar.todo.status],
                        height: '100%',
                        borderRadius: bar.isStart ? '4px' : '0 4px 4px 0',
                        borderLeft: bar.isStart ? 'none' : 'none',
                        marginLeft: bar.isStart ? '2px' : '0',
                        marginRight: bar.isEnd ? '2px' : '0',
                        opacity: 1,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px',
                        overflow: 'hidden',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {bar.isStart && (
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {bar.todo.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 특정 주(week) 동안 표시되어야 할 할 일 바(Bar) 정보들을 계산합니다.
 */
function getWeekBars(todos: Todo[], week: Date[]) {
  const weekStart = startOfDay(week[0]!)
  const weekEnd = endOfDay(week[6]!)
  
  const bars: { 
    todo: Todo; 
    startCol: number; 
    span: number; 
    isStart: boolean; 
    isEnd: boolean;
  }[] = []

  // 1. 해당 주에 걸쳐 있는 할 일 필터링 및 정렬
  const visibleTodos = todos.filter(todo => {
    const start = todo.startDate ? startOfDay(parseISO(todo.startDate)) : (todo.endDate ? startOfDay(parseISO(todo.endDate)) : null)
    const end = todo.endDate ? endOfDay(parseISO(todo.endDate)) : null
    
    if (!start || !end) return false
    
    return (isBefore(start, weekEnd) || isSameDay(start, weekEnd)) && 
           (isAfter(end, weekStart) || isSameDay(end, weekStart))
  }).sort((a, b) => {
    // 시작일이 빠른 순, 시작일이 같으면 기간이 긴 순
    const aStart = a.startDate ?? a.endDate ?? ''
    const bStart = b.startDate ?? b.endDate ?? ''
    if (aStart !== bStart) return aStart.localeCompare(bStart)
    const aEnd = a.endDate ?? ''
    const bEnd = b.endDate ?? ''
    return bEnd.localeCompare(b.startDate ?? bEnd) - aEnd.localeCompare(a.startDate ?? aEnd)
  })

  // 2. 바 위치 계산
  visibleTodos.forEach(todo => {
    const start = todo.startDate ? startOfDay(parseISO(todo.startDate)) : startOfDay(parseISO(todo.endDate!))
    const end = endOfDay(parseISO(todo.endDate!))
    
    const actualStart = isBefore(start, weekStart) ? weekStart : start
    const actualEnd = isAfter(end, weekEnd) ? weekEnd : end
    
    const startCol = week.findIndex(day => isSameDay(day, actualStart))
    const endCol = week.findIndex(day => isSameDay(day, actualEnd))
    
    if (startCol !== -1 && endCol !== -1) {
      bars.push({
        todo,
        startCol,
        span: endCol - startCol + 1,
        isStart: isSameDay(start, actualStart),
        isEnd: isSameDay(end, actualEnd)
      })
    }
  })

  return bars
}
