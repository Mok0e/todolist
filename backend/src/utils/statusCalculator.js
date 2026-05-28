'use strict';

const STATUS = {
  DONE: 'DONE',
  IN_PROGRESS: 'IN_PROGRESS',
  OVERDUE: 'OVERDUE',
  NOT_STARTED: 'NOT_STARTED',
};

/**
 * @param {{ status: string|null, start_date: string|null, end_date: string|null }} todo
 * @param {Date} [now] - 테스트용 기준 시각 (기본값: 현재)
 * @returns {'DONE'|'IN_PROGRESS'|'OVERDUE'|'NOT_STARTED'}
 */
function calculateStatus(todo, now = new Date()) {
  if (todo.status === STATUS.DONE) return STATUS.DONE;

  const today = toDateOnly(now);
  const start = todo.start_date ? toDateOnly(new Date(todo.start_date)) : null;
  const end = todo.end_date ? toDateOnly(new Date(todo.end_date)) : null;

  // 날짜 없음
  if (!start && !end) return STATUS.NOT_STARTED;

  // 종료일만 있음
  if (!start && end) {
    return today > end ? STATUS.OVERDUE : STATUS.NOT_STARTED;
  }

  // 시작일만 있음 (OVERDUE 없음)
  if (start && !end) {
    return today >= start ? STATUS.IN_PROGRESS : STATUS.NOT_STARTED;
  }

  // 시작일 + 종료일 모두 있음
  if (today < start) return STATUS.NOT_STARTED;
  if (today <= end) return STATUS.IN_PROGRESS;
  return STATUS.OVERDUE;
}

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

module.exports = { calculateStatus, STATUS };
