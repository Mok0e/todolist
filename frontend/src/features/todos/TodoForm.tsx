import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--separator)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '17px',
    fontFamily: 'var(--font-text)',
    boxSizing: 'border-box',
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

  const dateRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-sm)',
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
        <label htmlFor="todo-category" style={labelStyle}>카테고리</label>
        <select id="todo-category" {...register('categoryId')} style={selectStyle}>
          <option value="">기본</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 날짜 */}
      <div style={dateRowStyle}>
        <div style={fieldStyle}>
          <label htmlFor="todo-startDate" style={labelStyle}>시작일</label>
          <input id="todo-startDate" {...register('startDate')} type="date" style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="todo-endDate" style={labelStyle}>종료일</label>
          <input id="todo-endDate" {...register('endDate')} type="date" style={inputStyle} />
          {errors.endDate && <span style={errorStyle}>{errors.endDate.message}</span>}
        </div>
      </div>

      {/* 버튼 */}
      <div style={footerStyle}>
        <Button type="button" variant="tint" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" loading={isPending}>
          저장
        </Button>
      </div>
    </form>
  )
}
