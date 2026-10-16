import type { MetricPoint } from '../types/api.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { buildAreaPath, buildLinePath, chartMax, toChecks, toLatency } from '../utils/chart.ts'

interface TelemetryChartProps { points: MetricPoint[] }

export function TelemetryChart({ points }: TelemetryChartProps) {
  // Empty ranges render an explicit message instead of a decorative placeholder.
  if (points.length === 0) {
    return <p className={dashboardStyles.classes.chartEmpty}>No checks recorded in this range yet.</p>
  }

  const checks = points.map(toChecks)
  const latency = points.map(toLatency)
  const checksArea = buildAreaPath(checks, chartMax(checks))
  const checksLine = buildLinePath(checks, chartMax(checks))
  const latencyLine = buildLinePath(latency, chartMax(latency))

  return (
    <svg className={dashboardStyles.classes.chart} viewBox="0 0 720 220" role="img" aria-label="Requests and average response time for the selected range">
      <defs><linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b6ea64" stopOpacity=".18" /><stop offset="1" stopColor="#b6ea64" stopOpacity="0" /></linearGradient></defs>
      <g stroke="#252824" strokeWidth="1"><path d="M0 35H720M0 85H720M0 135H720M0 185H720" /></g>
      {checksArea ? <path d={checksArea} fill="url(#pulse-fill)" /> : null}
      {checksLine ? <path d={checksLine} fill="none" stroke="#b6ea64" strokeWidth="2" /> : null}
      {latencyLine ? <path d={latencyLine} fill="none" stroke="#43a9ff" strokeWidth="1.5" /> : null}
    </svg>
  )
}
