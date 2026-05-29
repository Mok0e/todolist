import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar as CalendarIcon } from 'lucide-react'
import { AppleCalendar } from './AppleCalendar'
import type { Todo, Category } from '@/types'
import { todosApi } from './api'
import { queryKeys } from '@/lib/queryKeys'
import { Button } from '@/components/ui/Button'

const todoSchema = z.object({
  title: z.string().min(1, '필수 입력 항목입니다.').max(100, '100자 이하로 입력해주세요.'),
  description: z.string().max(1000, '설명은 1000자 이하여야 합니다.').optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(
  (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
  { message: '종료일은 시작일 이후여야 합니다.', path: ['endDate'] }
)

type TodoFormValues = z.infer<typeof todoSchema>

export interface TodoFormProps {
  todo?: Todo
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
}

export function TodoForm({ todo, categories, onSuccess, onCancel }: TodoFormProps) {
  const queryClient = useQueryClient()
  const isEdit = todo != null

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo?.title ?? '',
      description: todo?.description ?? '',
      categoryId: todo?.category.id ?? '',
      startDate: todo?.startDate ?? '',
      endDate: todo?.endDate ?? '',
    },
  })

  const titleValue = watch('title') ?? ''
  const descriptionValue = watch('description') ?? ''
  const selectedCategoryId = watch('categoryId') ?? ''

  const { mutate, isPending } = useMutation({
    mutationFn: (values: TodoFormValues) => {
      const body = {
        title: values.title,
        description: values.description || undefined,
        categoryId: values.categoryId || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
      }
      if (isEdit) {
        return todosApi.update(todo.id, body)
      }
      return todosApi.create(body)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos.all })
      void queryClient.invalidateQueries({ queryKey: ['calendar'] })
      onSuccess()
    },
  })

  const onSubmit = (values: TodoFormValues) => {
    mutate(values)
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  }

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--separator-opaque)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '17px',
    fontFamily: 'var(--font-text)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  }

  const counterStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'right',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--color-red)',
  }

  const categoryContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '4px 0',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }

  const categoryPillStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: '14px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: '1.5px solid var(--separator)',
    transition: 'all 200ms ease',
    background: isActive ? 'var(--fill-tinted)' : 'var(--bg-secondary)',
    color: isActive ? 'var(--color-blue)' : 'var(--text-secondary)',
    borderColor: isActive ? 'var(--color-blue)' : 'var(--separator)',
  })

  const dateRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-sm)',
  }

  const dateInputWrapperStyle = (isFocused: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: isFocused ? '1.5px solid var(--color-blue)' : '1px solid var(--separator-opaque)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 150ms ease',
    boxShadow: isFocused ? '0 0 0 3px var(--fill-tinted)' : 'none',
  })

  const hiddenInputStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'YYYY / MM / DD'
    return dateStr.replace(/-/g, ' / ')
  }

  const startDateValue = watch('startDate')
  const endDateValue = watch('endDate')
  const [openCalendar, setOpenCalendar] = React.useState<'startDate' | 'endDate' | null>(null)
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)

  const handleDateClick = (e: React.MouseEvent, field: 'startDate' | 'endDate') => {
    const rect = e.currentTarget.getBoundingClientRect()
    setAnchorRect(rect)
    setOpenCalendar(openCalendar === field ? null : field)
  }

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-sm)',
    marginTop: 'var(--spacing-sm)',
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={formStyle}>
      {/* 제목 */}
      <div style={fieldStyle}>
        <label htmlFor="todo-title" style={labelStyle}>제목</label>
        <input id="todo-title" {...register('title')} style={inputStyle} placeholder="제목을 입력해주세요." />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {errors.title ? (
            <span style={errorStyle}>{errors.title.message}</span>
          ) : (
            <span />
          )}
          <span style={counterStyle}>{titleValue.length}/100</span>
        </div>
      </div>

      {/* 설명 */}
      <div style={fieldStyle}>
        <label htmlFor="todo-description" style={labelStyle}>설명 (선택)</label>
        <textarea id="todo-description" {...register('description')} style={textareaStyle} placeholder="설명을 입력해주세요." maxLength={1000} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {errors.description ? (
            <span style={errorStyle}>{errors.description.message}</span>
          ) : (
            <span />
          )}
          <span style={counterStyle}>{descriptionValue.length}/1000</span>
        </div>
      </div>

      {/* 카테고리 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>카테고리</label>
        <div style={categoryContainerStyle}>
          <button
            type="button"
            onClick={() => setValue('categoryId', '')}
            style={categoryPillStyle(selectedCategoryId === '')}
          >
            기본
          </button>
          {categories.filter((cat) => !cat.isDefault).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setValue('categoryId', cat.id)}
              style={categoryPillStyle(selectedCategoryId === cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 날짜 */}
      <div style={dateRowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>시작일</label>
          <div 
            style={dateInputWrapperStyle(openCalendar === 'startDate')}
            onClick={(e) => handleDateClick(e, 'startDate')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={16} color="var(--text-tertiary)" />
              <span style={{ color: startDateValue ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                {formatDate(startDateValue)}
              </span>
            </div>
          </div>
          {openCalendar === 'startDate' && (
            <AppleCalendar 
              selectedDate={startDateValue}
              anchorRect={anchorRect}
              onSelect={(date) => setValue('startDate', date)}
              onClose={() => setOpenCalendar(null)}
            />
          )}
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>종료일</label>
          <div 
            style={dateInputWrapperStyle(openCalendar === 'endDate')}
            onClick={(e) => handleDateClick(e, 'endDate')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={16} color="var(--text-tertiary)" />
              <span style={{ color: endDateValue ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                {formatDate(endDateValue)}
              </span>
            </div>
          </div>
          {openCalendar === 'endDate' && (
            <AppleCalendar 
              selectedDate={endDateValue}
              anchorRect={anchorRect}
              onSelect={(date) => setValue('endDate', date)}
              onClose={() => setOpenCalendar(null)}
            />
          )}
          {errors.endDate && <span style={errorStyle}>{errors.endDate.message}</span>}
        </div>
      </div>

      {/* 버튼 */}
      <div style={footerStyle}>
        <Button 
          type="submit" 
          loading={isPending}
          style={{ 
            height: '44px', 
            background: 'var(--color-blue)', 
            color: '#ffffff',
            padding: '0 24px'
          }}
        >
          저장
        </Button>
        <Button 
          type="button" 
          variant="tint" 
          onClick={onCancel}
          style={{ 
            height: '44px', 
            color: 'var(--text-primary)',
            padding: '0 16px'
          }}
        >
          취소
        </Button>
      </div>
    </form>
  )
}
