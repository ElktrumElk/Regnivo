import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivityTable } from '../components/ActivityTable.tsx'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { HealthRing } from '../components/HealthRing.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { MetricCard } from '../components/MetricCard.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { TelemetryChart } from '../components/TelemetryChart.tsx'
import { getDashboard } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formatBytes, formatNumber } from '../utils/format.ts'

export function OverviewPage() {
  const { data, error, loading } = useResource(getDashboard)

  if (loading) return <LoadingPanel />
  if (error || !data) return <ErrorPanel message={error} />

  return (
    <>
      <PageHeader eyebrow="Control center" title="Good evening, Demo" description="Your endpoints are responding normally. Here is the operational picture across every project in the last 30 days." actions={<><Link className={dashboardStyles.classes.secondaryButton} to="/app/projects">View projects</Link><Link className={dashboardStyles.classes.primaryButton} to="/app/monitors/new"><Plus size={14} />Add monitor</Link></>} />
      <section className={dashboardStyles.classes.metrics} aria-label="Account metrics">
        <MetricCard label="Total checks" value={formatNumber(data.summary.checks)} hint="Last 30 days" delta="Live" />
        <MetricCard label="Active monitors" value={String(data.activeMonitors)} hint={`Across ${data.projectCount} projects`} />
        <MetricCard label="Average latency" value={`${Math.round(data.summary.averageResponseMs)} ms`} hint={`p95 ${Math.round(data.summary.p95ResponseMs)} ms`} delta="Normal" />
        <MetricCard label="Bandwidth" value={formatBytes(data.summary.bytesReceived)} hint="Observed response bytes" />
      </section>
      <section className={dashboardStyles.classes.panels} aria-label="Monitoring charts">
        <article className={dashboardStyles.classes.chartPanel}>
          <div className={dashboardStyles.classes.panelHeader}><div><h2 className={dashboardStyles.classes.panelTitle}>Request telemetry</h2><p className={dashboardStyles.classes.panelMeta}>24-hour service profile · UTC</p></div><div className={dashboardStyles.classes.legend}><span className={dashboardStyles.classes.legendItem}><span className={dashboardStyles.classes.legendDotGreen} />Requests</span><span className={dashboardStyles.classes.legendItem}><span className={dashboardStyles.classes.legendDotBlue} />Latency</span></div></div>
          <TelemetryChart />
        </article>
        <article className={dashboardStyles.classes.healthPanel}>
          <div><h2 className={dashboardStyles.classes.panelTitle}>Network health</h2><p className={dashboardStyles.classes.panelMeta}>All monitor outcomes</p></div>
          <HealthRing value={data.summary.successRate} />
          <div className={dashboardStyles.classes.healthSummary}><div className={dashboardStyles.classes.healthStat}><p className={dashboardStyles.classes.healthValue}>{data.summary.successful}</p><p className={dashboardStyles.classes.healthLabel}>Successful</p></div><div className={dashboardStyles.classes.healthStat}><p className={dashboardStyles.classes.healthValue}>{data.summary.failed}</p><p className={dashboardStyles.classes.healthLabel}>Failed</p></div><div className={dashboardStyles.classes.healthStat}><p className={dashboardStyles.classes.healthValue}>{Math.round(data.summary.medianResponseMs)} ms</p><p className={dashboardStyles.classes.healthLabel}>Median</p></div></div>
        </article>
      </section>
      <section className={dashboardStyles.classes.section}>
        <header className={dashboardStyles.classes.sectionHeader}><div><h2 className={dashboardStyles.classes.panelTitle}>Recent activity</h2><p className={dashboardStyles.classes.panelMeta}>Latest manual and scheduled checks</p></div><Link className={dashboardStyles.classes.textLink} to="/app/activity">View all activity</Link></header>
        <ActivityTable activity={data.recentActivity} />
      </section>
    </>
  )
}
