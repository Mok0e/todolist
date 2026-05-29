import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { Todo, TodoFilters } from '@/types'
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

const statusOptions = [
  { value: '', label: '전체' },
  { value: 'NOT_STARTED', label: '시작전' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'OVERDUE', label: '기한초과' },
  { value: 'DONE', label: '완료' },
]

export function TodosPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<TodoFilters>({})
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: todos = [], isLoading } = useQuery({
    queryKey: queryKeys.todos.list(filters),
    queryFn: () => todosApi.list(filters),
  })

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => todosApi.complete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos.all }),
  })

  const incompleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.incomplete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos.all }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos.all }),
  })

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === '' ? undefined : (value as TodoFilters['status']),
    }))
  }

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      categoryId: value === '' ? undefined : value,
    }))
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
    gap: 'var(--spacing-sm)',
  }

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--separator)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontFamily: 'var(--font-text)',
    cursor: 'pointer',
    width: '160px',
  }

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
        <h1 style={titleStyle}>할 일 목록</h1>
        <Button onClick={handleAddClick}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          할 일 추가
        </Button>
      </div>

      {/* 필터 */}
      <div style={filterRowStyle}>
        <SegmentedControl
          options={statusOptions}
          value={currentStatus}
          onChange={handleStatusFilter}
        />
        <select style={selectStyle} value={filters.categoryId ?? ''} onChange={handleCategoryFilter}>
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
              title="등록된 할 일이 없습니다."
              description="할 일을 추가해서 오늘의 목표를 관리해 보세요."
              action={{ label: '+ 첫 번째 할 일 추가', onClick: handleAddClick }}
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
        title={editingTodo != null ? '할 일 수정' : '새 할 일'}
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
