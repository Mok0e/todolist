import { describe, expect, it } from 'vitest'

describe('i18n', () => {
  it('i18n 모듈이 임포트되어야 한다', async () => {
    const i18n = await import('@/lib/i18n')
    expect(i18n.default).toBeDefined()
  })

  it('한국어 번역이 존재해야 한다', async () => {
    const ko = await import('@/locales/ko.json')
    expect(ko.auth.login).toBe('로그인')
    expect(ko.todos.title).toBe('할 일')
    expect(ko.common.loading).toBe('로딩 중...')
  })

  it('영어 번역이 존재해야 한다', async () => {
    const en = await import('@/locales/en.json')
    expect(en.auth.login).toBe('Sign In')
    expect(en.todos.title).toBe('Todos')
    expect(en.common.loading).toBe('Loading...')
  })

  it('ko/en 번역 키가 일치해야 한다', async () => {
    const ko = await import('@/locales/ko.json')
    const en = await import('@/locales/en.json')

    const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, val]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key
        return typeof val === 'object' && val !== null
          ? getKeys(val as Record<string, unknown>, fullKey)
          : [fullKey]
      })
    }

    const koKeys = getKeys(ko).sort()
    const enKeys = getKeys(en).sort()
    expect(koKeys).toEqual(enKeys)
  })
})
