import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Folder } from 'lucide-react'
import { categoriesApi } from '@/features/categories/api'
import { queryKeys } from '@/lib/queryKeys'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { CategoryInlineForm } from '@/features/categories/CategoryInlineForm'
import type { ApiErrorData } from '@/lib/apiClient'
import { useTranslation, type TFunction } from 'react-i18next'

function isDuplicateError(error: unknown): boolean {
  if (error != null && typeof error === 'object' && 'code' in error) {
    return (error as ApiErrorData).code === 'CATEGORY_NAME_DUPLICATE'
  }
  return false
}

function getErrorMessage(error: unknown, t: TFunction<'translation', undefined>) {
  if (isDuplicateError(error)) {
    return t('categories.errors.nameDuplicate')
  }
  if (error != null && typeof error === 'object' && 'message' in error) {
    return String((error as ApiErrorData).message)
  }
  return t('common.error')
}

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | undefined>(undefined)
  const [editError, setEditError] = useState<string | undefined>(undefined)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const { t } = useTranslation()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => categoriesApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      setShowAddForm(false)
      setAddError(undefined)
    },
    onError: (error: unknown) => {
      setAddError(getErrorMessage(error, t))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => categoriesApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      setEditingId(null)
      setEditError(undefined)
    },
    onError: (error: unknown) => {
      setEditError(getErrorMessage(error, t))
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all })
    },
  })

  const handleAddClick = () => {
    setShowAddForm(true)
    setEditingId(null)
    setAddError(undefined)
  }

  const handleAddCancel = () => {
    setShowAddForm(false)
    setAddError(undefined)
  }

  const handleEditClick = (id: string) => {
    setEditingId(id)
    setShowAddForm(false)
    setEditError(undefined)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditError(undefined)
  }

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        t('categories.deleteConfirm', { categoryName: name }),
      )
    ) {
      removeMutation.mutate(id)
    }
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '32px 16px',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  }

  const listContainerStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--separator)',
  }

  const itemStyle = (isFirst: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '64px',
    padding: `0 var(--spacing-md)`,
    borderTop: isFirst ? 'none' : '1px solid var(--separator)',
  })

  const itemNameStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    flex: 1,
  }

  const defaultBadgeStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  }

  const disabledButtonStyle: React.CSSProperties = {
    opacity: 0.3,
    pointerEvents: 'none',
  }

  const actionGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{t('categories.title')}</h1>
        <Button
          onClick={handleAddClick}
          style={{ padding: `0 var(--spacing-md)` }}
        >
          <Plus size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
          {t('categories.add')}
        </Button>
      </div>

      {isLoading ? (
        <div data-testid="categories-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <Skeleton height="52px" borderRadius="var(--radius-lg)" />
          <Skeleton height="52px" borderRadius="var(--radius-lg)" />
          <Skeleton height="52px" borderRadius="var(--radius-lg)" />
        </div>
      ) : (
        <div data-testid="category-list" style={listContainerStyle}>
          {categories.map((category, index) => {
            const isFirst = index === 0
            const isEditing = editingId === category.id

            if (isEditing) {
              return (
                <div key={category.id} style={{ borderTop: isFirst ? 'none' : '1px solid var(--separator)' }}>
                  <CategoryInlineForm
                    initialValue={category.name}
                    isLoading={updateMutation.isPending}
                    error={editError}
                    onSave={(name) => updateMutation.mutate({ id: category.id, name })}
                    onCancel={handleEditCancel}
                  />
                </div>
              )
            }

            return (
              <div
                key={category.id}
                data-testid={category.isDefault ? 'default-category' : 'category-item'}
                style={itemStyle(isFirst)}
              >
                <div style={itemNameStyle}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: category.isDefault ? 'var(--bg-tertiary)' : 'var(--fill-tinted)', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0 
                  }}>
                    <Folder 
                      size={16} 
                      color={category.isDefault ? 'var(--text-tertiary)' : 'var(--color-blue)'} 
                      fill={category.isDefault ? 'var(--text-tertiary)' : 'var(--color-blue)'}
                      style={{ opacity: 0.8 }}
                    />
                  </div>
                  <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{category.name}</span>
                  {category.isDefault && (
                    <span style={defaultBadgeStyle}>{t('categories.defaultImmutable')}</span>
                  )}
                </div>
                <div style={actionGroupStyle}>
                  <button
                    onClick={() => handleEditClick(category.id)}
                    disabled={category.isDefault}
                    onMouseEnter={() => !category.isDefault && setHoveredButton(`edit-${category.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                      background: 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      cursor: category.isDefault ? 'default' : 'pointer',
                      padding: 0,
                      color: hoveredButton === `edit-${category.id}` ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      transition: 'color 150ms ease',
                      ...(category.isDefault ? disabledButtonStyle : {}),
                    }}
                    aria-label={t('categories.editButton', { categoryName: category.name })}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={category.isDefault || removeMutation.isPending}
                    onMouseEnter={() => !category.isDefault && setHoveredButton(`delete-${category.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                      background: 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      cursor: category.isDefault ? 'default' : 'pointer',
                      padding: 0,
                      color: hoveredButton === `delete-${category.id}` ? 'var(--color-red)' : 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      transition: 'color 150ms ease',
                      ...(category.isDefault ? disabledButtonStyle : {}),
                    }}
                    aria-label={t('categories.deleteButton', { categoryName: category.name })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}

          {showAddForm && (
            <div style={{ borderTop: categories.length > 0 ? '1px solid var(--separator)' : 'none' }}>
              <CategoryInlineForm
                isLoading={createMutation.isPending}
                error={addError}
                onSave={(name) => createMutation.mutate(name)}
                onCancel={handleAddCancel}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
