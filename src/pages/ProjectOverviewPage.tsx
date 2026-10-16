import { useCallback, useState, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { HealthRing } from '../components/HealthRing.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { MetricCard } from '../components/MetricCard.tsx'
import { MonitorTable } from '../components/MonitorTable.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { TelemetryChart } from '../components/TelemetryChart.tsx'
import { getProject, getProjectMetrics, pauseMonitor, resumeMonitor, testMonitor } from '../services/api.ts'
import type { Monitor } from '../types/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import { formatBytes, formatNumber } from '../utils/format.ts'

const RANGE_OPTIONS: { value: '24h' | '7d' | '30d'; label: string }[] = [
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

export function ProjectOverviewPage() {
  const params = useParams()
  const projectId = params.projectId ?? ''

  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [actionError, setActionError] = useState('')

  const loadProject = useCallback(() => getProject(projectId), [projectId])
  const loadMetrics = useCallback(() => getProjectMetrics(projectId, range), [projectId, range])

  const projectResource = useResource(loadProject)
  const metricsResource = useResource(loadMetrics)

  const detail = projectResource.data
  const metrics = metricsResource.data
  const loading = projectResource.loading
  const error = projectResource.error

  function handleRangeChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as '24h' | '7d' | '30d'
    setRange(value)
  }

  async function refreshProject() {
    const fresh = await getProject(projectId)
    projectResource.setData(fresh)
  }

  async function handleTestMonitor(monitor: Monitor) {
    setActionError('')
    try {
      await testMonitor(monitor.id)
      await refreshProject()
    } catch (reason) {
      const text = reason instanceof Error ? reason.message : 'Unable to run test.'
      setActionError(text)
    }
  }

  async function handleToggleMonitor(monitor: Monitor) {
    setActionError('')
    try {
      if (monitor.enabled) {
        await pauseMonitor(monitor.id)
      } else {
        await resumeMonitor(monitor.id)
      }
      await refreshProject()
    } catch (reason) {
      const text = reason instanceof Error ? reason.message : 'Unable to update monitor.'
      setActionError(text)
    }
  }

  if (loading) return <LoadingPanel />
  if (error || !detail) return <ErrorPanel message={error} />

  const summary = metrics?.summary
  const series = metrics?.series ?? []

  const actions = (
    <>
      <Link className={dashboardStyles.classes.secondaryButton} to="/app/projects">All projects</Link>
      <Link className={dashboardStyles.classes.primaryButton} to={`/app/projects/${projectId}/monitors/new`}><Plus size={14} />Add monitor</Link>
    </>
  )

  return (
    <>
      <PageHeader
        eyebrow="Project overview"
        title={detail.project.name}
        description={detail.project.description || 'No project description.'}
        actions={actions}
      />
      {actionError ? <p className={formStyles.classes.danger} role="alert">{actionError}</p> : null}
      <section className={dashboardStyles.classes.metrics} aria-label="Project metrics">
        <MetricCard label="Total checks" value={summary ? formatNumber(summary.checks) : '—'} hint="Selected range" />
        <MetricCard label="Success rate" value={summary ? `${summary.successRate.toFixed(1)}%` : '—'} hint="All outcomes" />
        <MetricCard label="Average latency" value={summary ? `${Math.round(summary.averageResponseMs)} ms` : '—'} hint={summary ? `p95 ${Math.round(summary.p95ResponseMs)} ms` : 'p95 —'} />
        <MetricCard label="Bandwidth" value={summary ? formatBytes(summary.bytesReceived) : '—'} hint="Response bytes" />
      </section>
      <section className={dashboardStyles.classes.panels} aria-label="Monitoring charts">
        <article className={dashboardStyles.classes.chartPanel}>
          <div className={dashboardStyles.classes.panelHeader}>
            <div>
              <h2 className={dashboardStyles.classes.panelTitle}>Request telemetry</h2>
              <p className={dashboardStyles.classes.panelMeta}>Checks and average latency for the selected range</p>
            </div>
            <div className={dashboardStyles.classes.rangeSelectWrap}>
              <label className={dashboardStyles.classes.rangeLabel} htmlFor="project-range">Range</label>
              <select id="project-range" className={dashboardStyles.classes.rangeSelect} value={range} onChange={handleRangeChange} aria-label="Metrics range">
                {RANGE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>
          <TelemetryChart points={series} />
        </article>
        <article className={dashboardStyles.classes.healthPanel}>
          <div>
            <h2 className={dashboardStyles.classes.panelTitle}>Network health</h2>
            <p className={dashboardStyles.classes.panelMeta}>Monitor outcomes for this project</p>
          </div>
          <HealthRing value={summary ? summary.successRate : 0} />
          <div className={dashboardStyles.classes.healthSummary}>
            <div className={dashboardStyles.classes.healthStat}><p className={dashboardStyles.classes.healthValue}>{summary ? summary.successful : 0}</p><p className={dashboardStyles.classes.healthLabel}>Successful</p></div>
            <div className={dashboardStyles.classes.healthStat}><p className={dashboardStyles.classes.healthValue}>{summary ? summary.failed : 0}</p><p className={dashboardStyles.classes.healthLabel}>Failed</p></div>
            <div className={dashboardStyles.classes.healthStat}><p className={dashboardStyles.classes.healthValue}>{summary ? Math.round(summary.medianResponseMs) : 0} ms</p><p className={dashboardStyles.classes.healthLabel}>Median</p></div>
          </div>
        </article>
      </section>
      <section className={dashboardStyles.classes.section}>
        <header className={dashboardStyles.classes.sectionHeader}>
          <div>
            <h2 className={dashboardStyles.classes.panelTitle}>Monitors</h2>
            <p className={dashboardStyles.classes.panelMeta}>{detail.monitors.length} endpoint{detail.monitors.length === 1 ? '' : 's'}</p>
          </div>
          <Link className={dashboardStyles.classes.textLink} to={`/app/projects/${projectId}/monitors/new`}>Add monitor</Link>
        </header>
        <MonitorTable monitors={detail.monitors} onTest={handleTestMonitor} onToggle={handleToggleMonitor} />
      </section>
    </>
  )
}
