import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CategoryInlineFormProps {
  initialValue?: string
  isLoading?: boolean
  error?: string
  onSave: (name: string) => void
  onCancel: () => void
}

const MAX_LENGTH = 30

export function CategoryInlineForm({
  initialValue = '',
  isLoading = false,
  error,
  onSave,
  onCancel,
}: CategoryInlineFormProps) {
  const [value, setValue] = useState(initialValue)

  const isAddMode = initialValue === ''
  const isSaveDisabled = value.trim().length === 0 || value.length > MAX_LENGTH

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSaveDisabled) {
      onSave(value.trim())
    }
  }

  const counterStyle: React.CSSProperties = {
    fontSize: '13px',
    color: value.length > MAX_LENGTH ? 'var(--color-red)' : 'var(--text-secondary)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1.5px solid var(--separator)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
    fontSize: '15px',
    fontFamily: 'var(--font-text)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--color-red)',
    marginTop: '4px',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  }

  const counterRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '4px',
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '12px 16px' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="카테고리 이름"
        autoFocus
        style={inputStyle}
      />
      <div style={counterRowStyle}>
        <span style={counterStyle}>{value.length}/{MAX_LENGTH}</span>
      </div>
      {error != null && <p style={errorStyle}>{error}</p>}
      <div style={rowStyle}>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isSaveDisabled}
          style={{ height: '38px', fontSize: '15px', padding: '0 16px' }}
        >
          {isAddMode ? '추가' : '저장'}
        </Button>
        <Button
          type="button"
          variant="tint"
          onClick={onCancel}
          disabled={isLoading}
          style={{ height: '38px', fontSize: '15px', padding: '0 16px' }}
        >
          취소
        </Button>
      </div>
    </form>
  )
}
