import { describe, expect, it } from 'vitest'
import { queryClient } from '@/lib/queryClient'

describe('queryClient', () => {
  it('QueryClient 인스턴스가 생성되어야 한다', () => {
    expect(queryClient).toBeDefined()
  })

  it('staleTime이 5분으로 설정되어야 한다', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5)
  })
})
