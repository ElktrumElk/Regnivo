import { describe, expect, it } from 'vitest'
import { buildAreaPath, buildLinePath, chartMax, verticalPosition, CHART_HEIGHT } from '../utils/chart.ts'

describe('chart utilities', () => {
  it('guards against empty series', () => {
    expect(buildLinePath([], 1)).toBe('')
    expect(buildAreaPath([], 1)).toBe('')
  })

  it('builds a line path for a single point', () => {
    const path = buildLinePath([10], 10)
    expect(path).toBeTruthy()
    expect(path.startsWith('M')).toBe(true)
  })

  it('builds line and area paths for multiple points', () => {
    const values = [0, 10, 5]
    const line = buildLinePath(values, 10)
    const area = buildAreaPath(values, 10)
    expect(line).toBeTruthy()
    expect(area).toBeTruthy()
    expect(area).toMatch(/^M.*L.*Z$/)
  })

  it('maps vertical position within plot bounds', () => {
    const max = 10
    expect(verticalPosition(0, max)).toBeLessThanOrEqual(CHART_HEIGHT - 20)
    expect(verticalPosition(10, max)).toBeGreaterThanOrEqual(30)
  })

  it('uses a minimum max to avoid division by zero', () => {
    expect(chartMax([0, 0, 0])).toBe(1)
  })
})
