import React from 'react'
import type { TodoStatus } from '@/types'

export interface StatusBadgeProps {
  status: TodoStatus
}

const STATUS_LABEL: Record<TodoStatus, string> = {
  NOT_STARTED: '시작전',
  IN_PROGRESS: '진행중',
  OVERDUE: '기한초과',
  DONE: '완료',
}

const STATUS_COLOR: Record<TodoStatus, string> = {
  NOT_STARTED: 'var(--color-gray)',
  IN_PROGRESS: 'var(--color-blue)',
  OVERDUE: 'var(--color-red)',
  DONE: 'var(--color-green)',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: 'var(--radius-full)',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 600,
    color: STATUS_COLOR[status],
    background: `color-mix(in srgb, ${STATUS_COLOR[status]} 12%, transparent)`,
  }

  return <span style={badgeStyle}>{STATUS_LABEL[status]}</span>
}
