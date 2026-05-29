import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { calendarApi } from '@/features/calendar/api'
import { categoriesApi } from '@/features/categories/api'
import { todosApi } from '@/features/todos/api'
import { CalendarGrid } from '@/features/calendar/CalendarGrid'
import { DayDetail } from '@/features/calendar/DayDetail'
import { Modal } from '@/components/ui/Modal'
import { TodoForm } from '@/features/todos/TodoForm'
import { queryKeys } from '@/lib/queryKeys'
import type { Todo } from '@/types'
import { useTranslation } from 'react-i18next'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getTodayStr(): string {
  const now = new Date()
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}



export function CalendarPage() {
  const today = getTodayStr()
  const todayDate = new Date(today + 'T00:00:00')
  const queryClient = useQueryClient()
  const { t } = useTranslation()



  const [year, setYear] = useState(todayDate.getFullYear())
  const [month, setMonth] = useState(todayDate.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(today)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showForm, setShowForm] = useState(false)
  const isDesktop = useIsDesktop()

  const dueDateFrom = toISODate(year, month, 1)
  const dueDateTo = toISODate(year, month, new Date(year, month, 0).getDate())

  const { data: todos = [], isLoading } = useQuery({
    queryKey: queryKeys.calendar.month(year, month),
    queryFn: () => calendarApi.list(dueDateFrom, dueDateTo),
  })

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  })

  const invalidateCalendar = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.month(year, month) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.todos.all })
  }

  const completeMutation = useMutation({
    mutationFn: (id: string) => todosApi.complete(id),
    onSettled: invalidateCalendar,
  })

  const incompleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.incomplete(id),
    onSettled: invalidateCalendar,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    onSettled: invalidateCalendar,
  })

  const moveMutation = useMutation({
    mutationFn: ({ id, startDate, endDate }: { id: string; startDate: string | null; endDate: string }) =>
      todosApi.update(id, { startDate: startDate ?? null, endDate }),
    onSettled: invalidateCalendar,
  })

  const handleToggleComplete = (todo: Todo) => {
    if (todo.status === 'DONE') {
      incompleteMutation.mutate(todo.id)
    } else {
      completeMutation.mutate(todo.id)
    }
  }

  const handleDeleteTodo = (id: string) => {
    if (window.confirm(t('todos.deleteConfirm'))) {
      deleteMutation.mutate(id)
    }
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    if (!isDesktop) setSheetOpen(true)
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(true)
    if (!isDesktop) setSheetOpen(false)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTodo(null)
    void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.month(year, month) })
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTodo(null)
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {t('calendar.title')}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            data-testid="prev-month-btn"
            onClick={handlePrevMonth}
            aria-label={t('calendar.prevMonth')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'unset',
              minWidth: 'unset',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <span
            data-testid="month-label"
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              minWidth: '80px',
              textAlign: 'center',
            }}
          >
            {t('calendar.monthYear', { year, month: t(`calendar.month_${month}`) })}
          </span>

          <button
            data-testid="next-month-btn"
            onClick={handleNextMonth}
            aria-label={t('calendar.nextMonth')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'unset',
              minWidth: 'unset',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          data-testid="calendar-skeleton"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            height: '320px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ) : (
        <div
          style={{
            display: isDesktop ? 'grid' : 'block',
            gridTemplateColumns: isDesktop ? '1.2fr 320px' : undefined,
            gap: '16px',
          }}
        >
          <CalendarGrid
            year={year}
            month={month}
            todos={todos}
            selectedDate={selectedDate}
            today={today}
            onDateSelect={handleDateSelect}
            onMoveTodo={(todoId, newStartDate, newEndDate) => {
              moveMutation.mutate({ id: todoId, startDate: newStartDate, endDate: newEndDate })
            }}
          />

          {isDesktop && (
            <DayDetail
              selectedDate={selectedDate}
              todos={todos}
              isOpen={true}
              onClose={() => setSheetOpen(false)}
              isDesktop={true}
              onEditTodo={handleEditTodo}
              onToggleComplete={handleToggleComplete}
              onDeleteTodo={handleDeleteTodo}
            />
          )}
        </div>
      )}

      {!isDesktop && (
        <DayDetail
          selectedDate={selectedDate}
          todos={todos}
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          isDesktop={false}
          onEditTodo={handleEditTodo}
          onToggleComplete={handleToggleComplete}
          onDeleteTodo={handleDeleteTodo}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={t('todos.editTodo')}
      >
        <TodoForm
          todo={editingTodo ?? undefined}
          categories={categories}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  )
}
