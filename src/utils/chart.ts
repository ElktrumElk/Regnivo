import type { MetricPoint } from '../types/api.ts'

// The chart plots inside a fixed 720x220 viewBox with breathing room top and bottom.
export const CHART_WIDTH = 720
export const CHART_HEIGHT = 220
const PLOT_TOP = 30
const PLOT_BOTTOM = 20

// chartMax keeps a flat or empty series from dividing by zero.
export function chartMax(values: number[]): number {
  const highest = values.reduce((peak, value) => (value > peak ? value : peak), 0)
  return highest > 0 ? highest : 1
}

// verticalPosition maps a raw metric value onto the plot band.
export function verticalPosition(value: number, max: number): number {
  const usableHeight = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM
  const ratio = Math.max(0, Math.min(1, value / max))
  return PLOT_TOP + (1 - ratio) * usableHeight
}

// buildLinePath turns a metric series into an SVG path string.
export function buildLinePath(values: number[], max: number): string {
  if (values.length === 0) return ''
  const step = values.length > 1 ? CHART_WIDTH / (values.length - 1) : 0
  return values
    .map((value, index) => {
      const x = values.length > 1 ? index * step : CHART_WIDTH / 2
      const command = index === 0 ? 'M' : 'L'
      return `${command}${x.toFixed(1)} ${verticalPosition(value, max).toFixed(1)}`
    })
    .join('')
}

// buildAreaPath closes the line down to the baseline so it can be filled.
export function buildAreaPath(values: number[], max: number): string {
  const line = buildLinePath(values, max)
  if (line === '') return ''
  const step = values.length > 1 ? CHART_WIDTH / (values.length - 1) : 0
  const lastX = values.length > 1 ? (values.length - 1) * step : CHART_WIDTH / 2
  const firstX = values.length > 1 ? 0 : CHART_WIDTH / 2
  return `${line}L${lastX.toFixed(1)} ${CHART_HEIGHT}L${firstX.toFixed(1)} ${CHART_HEIGHT}Z`
}

// toChecks and toLatency are named projections so JSX stays free of inline lambdas.
export function toChecks(point: MetricPoint): number { return point.checks }

export function toLatency(point: MetricPoint): number { return point.averageResponseMs }
