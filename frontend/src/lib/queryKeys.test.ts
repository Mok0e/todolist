import { describe, it, expect } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'

describe('queryKeys', () => {
  it('user.me() 키를 반환한다', () => {
    expect(queryKeys.user.me()).toEqual(['user', 'me'])
  })

  it('todos.all 키를 반환한다', () => {
    expect(queryKeys.todos.all).toEqual(['todos'])
  })

  it('todos.list() 필터 없이 호출 시 키를 반환한다', () => {
    const key = queryKeys.todos.list()
    expect(key[0]).toBe('todos')
    expect(key[1]).toBe('list')
  })

  it('todos.list() 필터 포함 시 필터가 키에 포함된다', () => {
    const filters = { status: 'DONE' as const }
    const key = queryKeys.todos.list(filters)
    expect(key[2]).toEqual(filters)
  })

  it('categories.list() 키를 반환한다', () => {
    expect(queryKeys.categories.list()).toEqual(['categories', 'list'])
  })

  it('categories.all 키를 반환한다', () => {
    expect(queryKeys.categories.all).toEqual(['categories'])
  })
})
