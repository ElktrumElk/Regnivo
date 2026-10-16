import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DeployLogPanel } from '../components/DeployLogPanel.tsx'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { HeaderEditor } from '../components/HeaderEditor.tsx'
import { headerRowsToRecord } from '../utils/headers.ts'
import type { HeaderRow } from '../utils/headers.ts'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { createMonitor, getProjects, testMonitor } from '../services/api.ts'
import type { CheckResult, Project } from '../types/api.ts'
import type { DeployLogEntry, LogLevel } from '../types/log.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import { formatBytes } from '../utils/format.ts'

const METHOD_OPTIONS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

const INTERVAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 600, label: 'Every 10 minutes' },
  { value: 1200, label: 'Every 20 minutes' },
  { value: 1500, label: 'Every 25 minutes' },
  { value: 2100, label: 'Every 35 minutes' },
  { value: 2400, label: 'Every 40 minutes' },
  { value: 3600, label: 'Every hour' },
  { value: 18000, label: 'Every 5 hours' },
  { value: 36000, label: 'Every 10 hours' },
  { value: 54000, label: 'Every 15 hours' },
  { value: 86400, label: 'Every 24 hours' },
]

const TIMEOUT_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 5000, label: '5 seconds' },
  { value: 10000, label: '10 seconds' },
  { value: 20000, label: '20 seconds' },
  { value: 30000, label: '30 seconds' },
]

const RETRY_COUNT_OPTIONS = [0, 1, 2, 3, 4, 5]

const RETRY_TIMEOUT_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 5000, label: '5 seconds' },
  { value: 10000, label: '10 seconds' },
  { value: 20000, label: '20 seconds' },
  { value: 30000, label: '30 seconds' },
]

function renderProjectOption(project: Project) {
  return <option key={project.id} value={project.id}>{project.name}</option>
}

function renderMethodOption(method: string) {
  return <option key={method} value={method}>{method}</option>
}

function renderIntervalOption(option: { value: number; label: string }) {
  return <option key={option.value} value={option.value}>{option.label}</option>
}

function renderTimeoutOption(option: { value: number; label: string }) {
  return <option key={option.value} value={option.value}>{option.label}</option>
}

function renderRetryCountOption(count: number) {
  return <option key={count} value={count}>{count === 0 ? 'No retries' : `${count} ${count === 1 ? 'retry' : 'retries'}`}</option>
}

function formatCheckResult(result: CheckResult): string {
  const status = result.statusCode ? String(result.statusCode) : 'no response'
  const suffix = result.message ? ` · ${result.message}` : ''
  return `${status} · ${result.durationMs} ms · ${formatBytes(result.bytesReceived)}${suffix}`
}

export function AddMonitorPage() {
  const params = useParams()
  const scopedProjectId = params.projectId

  const { data: projects, error, loading } = useResource(getProjects)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [logEntries, setLogEntries] = useState<DeployLogEntry[]>([])
  const [logVisible, setLogVisible] = useState(false)
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>([])
  const navigate = useNavigate()

  function appendLog(level: LogLevel, text: string) {
    setLogEntries(current => [
      ...current,
      { id: current.length + 1, time: new Date().toLocaleTimeString(), level, message: text },
    ])
  }

  function handleCloseLog() { setLogVisible(false) }

  function goToProjects() { navigate('/app/projects') }

  function goToProject(projectId: string) { navigate(`/app/projects/${projectId}`) }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setLogEntries([])
    setLogVisible(true)

    const form = event.currentTarget
    const values = new FormData(form)

    const projectId = scopedProjectId ?? String(values.get('projectId'))
    const input = {
      name: String(values.get('name')),
      url: String(values.get('url')),
      method: String(values.get('method')),
      intervalSeconds: Number(values.get('intervalSeconds')),
      timeoutMs: Number(values.get('timeoutMs')),
      expectedStatus: [Number(values.get('expectedStatus'))],
      enabled: values.get('enabled') === 'on',
      retryCount: Number(values.get('retryCount')),
      retryTimeoutMs: Number(values.get('retryTimeoutMs')),
      headers: headerRowsToRecord(headerRows),
    }

    appendLog('info', `Validating target ${input.method} ${input.url}`)

    try {
      const monitor = await createMonitor(projectId, input)
      appendLog('success', `Monitor “${monitor.name}” created`)
      appendLog('request', `Sending ${monitor.method} ${monitor.url} · first check`)
      const result = await testMonitor(monitor.id)
      appendLog(result.outcome === 'success' ? 'success' : 'error', formatCheckResult(result))
      setMessage('Monitor deployed. Its first check completed.')
      form.reset()
      setHeaderRows([])
    } catch (reason) {
      const text = reason instanceof Error ? reason.message : 'Unable to deploy monitor.'
      appendLog('error', text)
      setMessage(text)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingPanel />
  if (error || !projects) return <ErrorPanel message={error} />

  if (!scopedProjectId && projects.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Monitor deployment" title="Add monitor" description="Create a project before registering an endpoint." />
        <button className={dashboardStyles.classes.primaryButton} type="button" onClick={goToProjects}>Create project</button>
      </>
    )
  }

  const scopedProjectName = scopedProjectId ? projects.find(p => p.id === scopedProjectId)?.name : undefined
  const title = scopedProjectId ? 'Add endpoint' : 'Add endpoint'
  const description = scopedProjectId ? 'Register an endpoint in this project. First check runs after deployment.' : 'Register an existing public HTTPS endpoint. Regnivo validates the destination before saving and before every check.'

  return (
    <>
      <PageHeader eyebrow="Monitor deployment" title={title} description={description} />
      <DeployLogPanel entries={logEntries} visible={logVisible} onClose={handleCloseLog} />
      <section className={formStyles.classes.card}>
        <form className={formStyles.classes.form} onSubmit={handleSubmit}>
          <div className={formStyles.classes.row}>
            {scopedProjectId ? (
              <div className={formStyles.classes.field}>
                <span className={formStyles.classes.label}>Project</span>
                <p className={formStyles.classes.hint}>{scopedProjectName ?? 'Selected project'}</p>
              </div>
            ) : (
              <div className={formStyles.classes.field}>
                <label className={formStyles.classes.label} htmlFor="monitor-project">Project</label>
                <select className={formStyles.classes.input} id="monitor-project" name="projectId" required>{projects.map(renderProjectOption)}</select>
              </div>
            )}
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-name">Endpoint name</label>
              <input className={formStyles.classes.input} id="monitor-name" name="name" placeholder="API health" required maxLength={100} />
            </div>
          </div>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="monitor-url">Target URL</label>
            <input className={formStyles.classes.input} id="monitor-url" name="url" type="url" placeholder="https://api.example.com/health" pattern="https://.*" required />
            <p className={formStyles.classes.hint}>HTTPS only. Private, loopback, metadata, reserved, and credential-bearing destinations are blocked.</p>
          </div>
          <div className={formStyles.classes.row}>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-method">Request method</label>
              <select className={formStyles.classes.input} id="monitor-method" name="method" defaultValue="GET">{METHOD_OPTIONS.map(renderMethodOption)}</select>
            </div>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-interval">Check interval</label>
              <select className={formStyles.classes.input} id="monitor-interval" name="intervalSeconds" defaultValue="600">{INTERVAL_OPTIONS.map(renderIntervalOption)}</select>
            </div>
          </div>
          <div className={formStyles.classes.row}>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-timeout">Timeout</label>
              <select className={formStyles.classes.input} id="monitor-timeout" name="timeoutMs" defaultValue="10000">{TIMEOUT_OPTIONS.map(renderTimeoutOption)}</select>
            </div>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-status">Expected status</label>
              <input className={formStyles.classes.input} id="monitor-status" name="expectedStatus" type="number" min="100" max="599" defaultValue="200" />
            </div>
          </div>
          <div className={formStyles.classes.row}>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-retry-count">Retries after failure</label>
              <select className={formStyles.classes.input} id="monitor-retry-count" name="retryCount" defaultValue="0">{RETRY_COUNT_OPTIONS.map(renderRetryCountOption)}</select>
              <p className={formStyles.classes.hint}>Failed checks are retried immediately, up to 5 times, before the next scheduled run.</p>
            </div>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-retry-timeout">Retry timeout</label>
              <select className={formStyles.classes.input} id="monitor-retry-timeout" name="retryTimeoutMs" defaultValue="10000">{RETRY_TIMEOUT_OPTIONS.map(renderTimeoutOption)}</select>
              <p className={formStyles.classes.hint}>Longer per-request timeout applied to each retry attempt.</p>
            </div>
          </div>
          <HeaderEditor rows={headerRows} onChange={setHeaderRows} />
          <label className={formStyles.classes.checkboxRow}><span><strong className={formStyles.classes.label}>Activate monitoring</strong><p className={formStyles.classes.hint}>Schedule server-side checks immediately after deployment.</p></span><input className={formStyles.classes.checkbox} type="checkbox" name="enabled" defaultChecked /></label>
          <div className={formStyles.classes.actions}>
            <button className={dashboardStyles.classes.primaryButton} type="submit" disabled={saving}>{saving ? 'Deploying and running first check...' : 'Deploy monitor'}</button>
            {message ? <p className={message.includes('deployed') || message.includes('completed') ? formStyles.classes.message : formStyles.classes.danger} role="status">{message}</p> : null}
            {scopedProjectId ? <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={() => goToProject(scopedProjectId)}>Back to project</button> : null}
          </div>
        </form>
      </section>
    </>
  )
}
