import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO,
  isValid
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AppleCalendarProps {
  selectedDate?: string
  anchorRect: DOMRect | null
  onSelect: (date: string) => void
  onClose: () => void
}

export function AppleCalendar({ selectedDate, anchorRect, onSelect, onClose }: AppleCalendarProps) {
  const initialDate = selectedDate && isValid(parseISO(selectedDate)) 
    ? parseISO(selectedDate) 
    : new Date()
    
  const [currentMonth, setCurrentMonth] = useState(initialDate)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!anchorRect) return null

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  // Calculate position based on anchorRect
  const calendarWidth = 300
  const calendarHeight = 340 // Approximate height of the calendar
  const margin = 8
  
  const spaceBelow = window.innerHeight - anchorRect.bottom
  const showAbove = spaceBelow < calendarHeight && anchorRect.top > calendarHeight

  const top = showAbove 
    ? anchorRect.top + window.scrollY - calendarHeight - margin
    : anchorRect.bottom + window.scrollY + margin
    
  let left = anchorRect.left + window.scrollX

  // Basic boundary check
  if (left + calendarWidth > window.innerWidth) {
    left = window.innerWidth - calendarWidth - 16
  }

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--separator)',
    boxShadow: 'var(--shadow-xl)',
    padding: '16px',
    width: `${calendarWidth}px`,
    animation: showAbove ? 'fade-in-up 200ms var(--spring-default)' : 'modal-appear 200ms var(--spring-default)',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  }

  const monthTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  }

  const dayLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-tertiary)',
    textAlign: 'center',
    paddingBottom: '8px',
  }

  const navButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
  }

  return createPortal(
    <div 
      ref={calendarRef}
      style={containerStyle} 
      onClick={(e) => e.stopPropagation()}
    >
      <div style={headerStyle}>
        <span style={monthTitleStyle}>
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={prevMonth} style={navButtonStyle}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={nextMonth} style={navButtonStyle}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={gridStyle}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} style={dayLabelStyle}>{day}</div>
        ))}
        {calendarDays.map((day) => {
          const isSelected = selectedDate ? isSameDay(day, parseISO(selectedDate)) : false
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isToday = isSameDay(day, new Date())

          const dayStyle: React.CSSProperties = {
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'all 150ms ease',
            color: isSelected ? '#ffffff' : isToday ? 'var(--color-blue)' : (isCurrentMonth ? 'var(--text-primary)' : 'var(--text-placeholder)'),
            background: isSelected ? 'var(--color-blue)' : 'transparent',
            border: isToday && !isSelected ? '1px solid var(--color-blue)' : 'none',
            fontWeight: isSelected || isToday ? 600 : 500,
          }

          return (
            <div
              key={day.toString()}
              style={dayStyle}
              onClick={() => {
                onSelect(format(day, 'yyyy-MM-dd'))
                onClose()
              }}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
    </div>,
    document.body
  )
}
