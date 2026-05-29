import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { Todo, TodoFilters, TodoStatus } from '@/types'
import { todosApi } from '@/features/todos/api'
import { categoriesApi } from '@/features/categories/api'
import { queryKeys } from '@/lib/queryKeys'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { TodoCard } from '@/features/todos/TodoCard'
import { TodoForm } from '@/features/todos/TodoForm'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

export function TodosPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<TodoFilters>({})
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { t } = useTranslation()

  const statusOptions = [
    { value: '', label: t('todos.filterAll') },
    { value: 'NOT_STARTED', label: t('todos.filterNotStarted') },
    { value: 'IN_PROGRESS', label: t('todos.filterInProgress') },
    { value: 'OVERDUE', label: t('todos.filterOverdue') },
    { value: 'DONE', label: t('todos.filterDone') },
  ]

  const { data: todos = [], isLoading } = useQuery({
    queryKey: queryKeys.todos.list(filters),
    queryFn: () => todosApi.list(filters),
  })

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  })

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.todos.all })
    void queryClient.invalidateQueries({ queryKey: ['calendar'] })
  }

  const completeMutation = useMutation({
    mutationFn: (id: string) => todosApi.complete(id),
    onSettled: invalidateAll,
  })

  const incompleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.incomplete(id),
    onSettled: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    onSettled: invalidateAll,
  })

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => {
      const { status: _, ...rest } = prev
      return value === '' ? rest : { ...rest, status: value as TodoStatus }
    })
  }

  const handleCategoryFilter = (value: string) => {
    setFilters((prev) => {
      const { categoryId: _, ...rest } = prev
      return value === '' ? rest : { ...rest, categoryId: value }
    })
  }

  const handleAddClick = () => {
    setEditingTodo(null)
    setShowForm(true)
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTodo(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTodo(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('이 할 일을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: 'var(--spacing-xl) var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  }

  const filterRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  }

  const categoryFilterStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    overflowX: 'auto',
    paddingBottom: '4px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  }

  const pillStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: '14px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 200ms var(--spring-default)',
    background: isActive ? 'var(--fill-tinted)' : 'var(--bg-secondary)',
    color: isActive ? 'var(--color-blue)' : 'var(--text-secondary)',
    boxShadow: isActive ? '0 2px 8px rgba(10, 132, 255, 0.15)' : 'none',
  })

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  }

  const currentStatus = filters.status ?? ''

  return (
    <div style={pageStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{t('todos.title')}</h1>
        <Button onClick={handleAddClick}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          {t('todos.add')}
        </Button>
      </div>

      {/* 필터 */}
      <div style={filterRowStyle}>
        <SegmentedControl
          options={statusOptions}
          value={currentStatus}
          onChange={handleStatusFilter}
        />
        <div style={categoryFilterStyle}>
          <button
            onClick={() => handleCategoryFilter('')}
            style={pillStyle(filters.categoryId === undefined)}
          >
            {t('todos.filterAll')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              style={pillStyle(filters.categoryId === cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div style={listStyle}>
        {isLoading ? (
          <div data-testid="todos-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <Skeleton height="88px" borderRadius="var(--radius-lg)" />
            <Skeleton height="88px" borderRadius="var(--radius-lg)" />
            <Skeleton height="88px" borderRadius="var(--radius-lg)" />
          </div>
        ) : todos.length === 0 ? (
          <div data-testid="todos-empty">
            <EmptyState
              title={t('todos.empty')}
              description={t('todos.emptyDescription')}
            />
          </div>
        ) : (
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onComplete={(id) => completeMutation.mutate(id)}
              onIncomplete={(id) => incompleteMutation.mutate(id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* 폼 모달 */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingTodo != null ? t('todos.editTodo') : t('todos.newTodo')}
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
