import { dashboardStyles } from '../styles/dashboardStyles.ts'

interface MetricCardProps { label: string; value: string; hint: string; delta?: string }

export function MetricCard({ label, value, hint, delta }: MetricCardProps) {
  return (
    <article className={dashboardStyles.classes.metric}>
      <div className={dashboardStyles.classes.metricTop}><p className={dashboardStyles.classes.metricLabel}>{label}</p>{delta ? <span className={dashboardStyles.classes.metricDelta}>{delta}</span> : null}</div>
      <p className={dashboardStyles.classes.metricValue}>{value}</p>
      <p className={dashboardStyles.classes.metricHint}>{hint}</p>
    </article>
  )
}
