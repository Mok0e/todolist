'use strict';

const { calculateStatus, STATUS } = require('../statusCalculator');

const d = (str) => new Date(str); // '2026-05-28' → Date

describe('calculateStatus', () => {
  const TODAY = d('2026-05-28');

  // 1. DONE은 날짜 무관하게 항상 DONE
  test('DONE 상태는 날짜 무관하게 DONE 반환', () => {
    expect(calculateStatus({ status: 'DONE', start_date: '2020-01-01', end_date: '2020-01-01' }, TODAY)).toBe(STATUS.DONE);
    expect(calculateStatus({ status: 'DONE', start_date: null, end_date: null }, TODAY)).toBe(STATUS.DONE);
    expect(calculateStatus({ status: 'DONE', start_date: '2099-01-01', end_date: null }, TODAY)).toBe(STATUS.DONE);
  });

  // 2. 날짜 없음 → NOT_STARTED
  test('날짜 없음 → NOT_STARTED', () => {
    expect(calculateStatus({ status: null, start_date: null, end_date: null }, TODAY)).toBe(STATUS.NOT_STARTED);
  });

  // 3. 시작일만 있음
  test('시작일만 있음 — 오늘이 시작일 이전 → NOT_STARTED', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-29', end_date: null }, TODAY)).toBe(STATUS.NOT_STARTED);
  });

  test('시작일만 있음 — 오늘이 시작일 당일 → IN_PROGRESS', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-28', end_date: null }, TODAY)).toBe(STATUS.IN_PROGRESS);
  });

  test('시작일만 있음 — 오늘이 시작일 이후 → IN_PROGRESS (OVERDUE 없음)', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-01', end_date: null }, TODAY)).toBe(STATUS.IN_PROGRESS);
  });

  // 4. 종료일만 있음
  test('종료일만 있음 — 오늘이 종료일 이전 → NOT_STARTED', () => {
    expect(calculateStatus({ status: null, start_date: null, end_date: '2026-05-29' }, TODAY)).toBe(STATUS.NOT_STARTED);
  });

  test('종료일만 있음 — 오늘이 종료일 당일 → NOT_STARTED', () => {
    expect(calculateStatus({ status: null, start_date: null, end_date: '2026-05-28' }, TODAY)).toBe(STATUS.NOT_STARTED);
  });

  test('종료일만 있음 — 오늘이 종료일 이후 → OVERDUE', () => {
    expect(calculateStatus({ status: null, start_date: null, end_date: '2026-05-27' }, TODAY)).toBe(STATUS.OVERDUE);
  });

  // 5. 시작일 + 종료일 모두 있음
  test('시작일 이전 → NOT_STARTED', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-29', end_date: '2026-05-31' }, TODAY)).toBe(STATUS.NOT_STARTED);
  });

  test('시작일 당일 → IN_PROGRESS', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-28', end_date: '2026-05-31' }, TODAY)).toBe(STATUS.IN_PROGRESS);
  });

  test('종료일 당일 → IN_PROGRESS', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-01', end_date: '2026-05-28' }, TODAY)).toBe(STATUS.IN_PROGRESS);
  });

  test('종료일 다음날 → OVERDUE', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-01', end_date: '2026-05-27' }, TODAY)).toBe(STATUS.OVERDUE);
  });

  // 6. 시작일=종료일 엣지 케이스
  test('시작일=종료일 — 당일 → IN_PROGRESS', () => {
    expect(calculateStatus({ status: null, start_date: '2026-05-28', end_date: '2026-05-28' }, TODAY)).toBe(STATUS.IN_PROGRESS);
  });

  test('시작일=종료일 — 익일 → OVERDUE', () => {
    const TOMORROW = d('2026-05-29');
    expect(calculateStatus({ status: null, start_date: '2026-05-28', end_date: '2026-05-28' }, TOMORROW)).toBe(STATUS.OVERDUE);
  });

  // 7. now 인자 주입 동작 확인
  test('now 인자 주입으로 날짜 기준 변경 가능', () => {
    const todo = { status: null, start_date: '2026-06-01', end_date: '2026-06-30' };
    expect(calculateStatus(todo, d('2026-05-28'))).toBe(STATUS.NOT_STARTED);
    expect(calculateStatus(todo, d('2026-06-15'))).toBe(STATUS.IN_PROGRESS);
    expect(calculateStatus(todo, d('2026-07-01'))).toBe(STATUS.OVERDUE);
  });
});
