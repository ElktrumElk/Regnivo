import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { HeaderEditor } from '../components/HeaderEditor.tsx'
import { headerRowsToRecord, recordToHeaderRows } from '../utils/headers.ts'
import type { HeaderRow } from '../utils/headers.ts'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { deleteMonitor, getMonitor, updateMonitor } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import type { Monitor, MonitorInput } from '../types/api.ts'

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

// Keeps a value selectable even when it is not one of the preset options.
function withCurrentValue(options: Array<{ value: number; label: string }>, current: number) {
  if (options.some(option => option.value === current)) return options
  return [{ value: current, label: `Every ${current} seconds` }, ...options]
}

interface MonitorFormProps { monitor: Monitor; projectId: string }

// Extracted so its local state can be initialised directly from the loaded
// monitor; the parent keys it by monitor id to re-seed on navigation.
function MonitorForm({ monitor, projectId }: MonitorFormProps) {
  const navigate = useNavigate()
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>(recordToHeaderRows(monitor.headers))
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [message, setMessage] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)

  const intervalOptions = withCurrentValue(INTERVAL_OPTIONS, monitor.intervalSeconds)
  const timeoutOptions = withCurrentValue(TIMEOUT_OPTIONS, monitor.timeoutMs)

  function handleConfirmRemove() { setConfirmRemove(true) }
  function handleCancelRemove() { setConfirmRemove(false) }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const values = new FormData(event.currentTarget)
    const input: Partial<MonitorInput> = {
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
    try {
      await updateMonitor(monitor.id, input)
      setMessage('Monitor updated.')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to update monitor.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setMessage('')
    try {
      await deleteMonitor(monitor.id)
      navigate(`/app/projects/${projectId}/settings`)
      return
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to remove monitor.')
      setRemoving(false)
      setConfirmRemove(false)
    }
  }

  return (
    <>
      <form className={`${formStyles.classes.card} ${formStyles.classes.stack}`} onSubmit={handleSave} aria-label="Monitor configuration">
        <div className={formStyles.classes.row}>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="edit-name">Endpoint name</label>
            <input className={formStyles.classes.input} id="edit-name" name="name" defaultValue={monitor.name} maxLength={100} required />
          </div>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="edit-method">Request method</label>
            <select className={formStyles.classes.input} id="edit-method" name="method" defaultValue={monitor.method}>{METHOD_OPTIONS.map(renderMethodOption)}</select>
          </div>
        </div>
        <div className={formStyles.classes.field}>
          <label className={formStyles.classes.label} htmlFor="edit-url">Target URL</label>
          <input className={formStyles.classes.input} id="edit-url" name="url" type="url" defaultValue={monitor.url} pattern="https://.*" required />
        </div>
        <div className={formStyles.classes.row}>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="edit-interval">Check interval</label>
            <select className={formStyles.classes.input} id="edit-interval" name="intervalSeconds" defaultValue={String(monitor.intervalSeconds)}>{intervalOptions.map(renderIntervalOption)}</select>
          </div>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="edit-timeout">Timeout</label>
            <select className={formStyles.classes.input} id="edit-timeout" name="timeoutMs" defaultValue={String(monitor.timeoutMs)}>{timeoutOptions.map(renderTimeoutOption)}</select>
          </div>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="edit-status">Expected status</label>
            <input className={formStyles.classes.input} id="edit-status" name="expectedStatus" type="number" min="100" max="599" defaultValue={monitor.expectedStatus[0] ?? 200} />
          </div>
        </div>
        <div className={formStyles.classes.row}>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="edit-retry-count">Retries after failure</label>
            <select className={formStyles.classes.input} id="edit-retry-count" name="retryCount" defaultValue={String(monitor.retryCount)}>{RETRY_COUNT_OPTIONS.map(renderRetryCountOption)}</select>
          </div>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="edit-retry-timeout">Retry timeout</label>
            <select className={formStyles.classes.input} id="edit-retry-timeout" name="retryTimeoutMs" defaultValue={String(monitor.retryTimeoutMs)}>{withCurrentValue(TIMEOUT_OPTIONS, monitor.retryTimeoutMs).map(renderTimeoutOption)}</select>
          </div>
        </div>
        <HeaderEditor rows={headerRows} onChange={setHeaderRows} />
        <label className={formStyles.classes.checkboxRow}><span><strong className={formStyles.classes.label}>Monitoring enabled</strong><p className={formStyles.classes.hint}>Paused monitors keep their history and resume on demand.</p></span><input className={formStyles.classes.checkbox} type="checkbox" name="enabled" defaultChecked={monitor.enabled} /></label>
        {message ? <p className={formStyles.classes.statusMessage} role="status">{message}</p> : null}
        <div className={formStyles.classes.actions}>
          <button className={dashboardStyles.classes.primaryButton} type="submit" disabled={saving}><Save size={14} />{saving ? 'Saving...' : 'Save changes'}</button>
          <Link className={dashboardStyles.classes.secondaryButton} to={`/app/projects/${projectId}`}><ArrowLeft size={14} />Back to project</Link>
        </div>
      </form>

      <section className={`${formStyles.classes.card} ${formStyles.classes.stack} ${formStyles.classes.cardSpaced} ${formStyles.classes.dangerCard}`} aria-label="Remove monitor">
        <div className={formStyles.classes.field}>
          <span className={formStyles.classes.label}>Remove monitor</span>
          <p className={formStyles.classes.hint}>Removing this monitor deletes it and its check history. This action cannot be undone.</p>
        </div>
        <div className={formStyles.classes.actions}>
          {confirmRemove ? (
            <>
              <button className={`${dashboardStyles.classes.primaryButton} ${formStyles.classes.dangerButton}`} type="button" onClick={handleRemove} disabled={removing}><Trash2 size={14} />{removing ? 'Removing...' : 'Confirm removal'}</button>
              <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleCancelRemove} disabled={removing}>Cancel</button>
            </>
          ) : (
            <button className={`${dashboardStyles.classes.primaryButton} ${formStyles.classes.dangerButton}`} type="button" onClick={handleConfirmRemove}><Trash2 size={14} />Remove monitor</button>
          )}
        </div>
      </section>
    </>
  )
}

export function EditMonitorPage() {
  const params = useParams()
  const projectId = params.projectId ?? ''
  const monitorId = params.monitorId ?? ''

  const loadMonitor = useCallback(() => getMonitor(monitorId), [monitorId])
  const { data: monitor, error, loading } = useResource(loadMonitor)

  if (loading) return <LoadingPanel />
  if (error || !monitor) return <ErrorPanel message={error} />

  return (
    <>
      <PageHeader eyebrow="Monitor" title={`${monitor.name} · configuration`} description="Update this endpoint's schedule, retries, and request headers." />
      <MonitorForm key={monitor.id} monitor={monitor} projectId={projectId} />
    </>
  )
}
