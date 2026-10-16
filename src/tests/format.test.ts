import { describe, expect, it } from 'vitest'
import { formatBytes, formatNumber } from '../utils/format.ts'

describe('dashboard formatters', () => {
  it('formats observed response bytes with useful units', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('keeps small check totals readable', () => {
    expect(formatNumber(125)).toBe('125')
  })
})
