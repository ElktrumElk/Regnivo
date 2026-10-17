import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { LogDetailPanel } from '../components/LogDetailPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { clearProjectResults, deleteResult, getProject, getProjectResults, testMonitor } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import { logStyles } from '../styles/logStyles.ts'
import type { CheckResult } from '../types/api.ts'

const AUTO_REFRESH_MS = 10_000

function formatResult(result: CheckResult): string {
  const status = result.statusCode ? String(result.statusCode) : 'no response'
  const trigger = (result.trigger ?? 'check').toUpperCase()
  const prefix = `[${new Date(result.startedAt).toLocaleTimeString()}] ${trigger} ${result.method} ${result.url}`
  const suffix = result.message ? ` · ${result.message}` : ''
  return `${prefix} → ${status} · ${result.durationMs} ms · ${result.bytesReceived} B${suffix}`
}

export function ProjectLogPage() {
  const params = useParams()
  const projectId = params.projectId ?? ''
  const [searchParams, setSearchParams] = useSearchParams()
  const runMonitorId = searchParams.get('runMonitorId') ?? ''
  const runMonitorName = searchParams.get('monitorName') ?? 'monitor'
  const startedMonitorRef = useRef('')

  const loadProject = useCallback(() => getProject(projectId), [projectId])
  const loadResults = useCallback(() => getProjectResults(projectId), [projectId])

  const projectResource = useResource(loadProject)
  const { data: results, error: resultsError, loading: resultsLoading, setData: setResults } = useResource(loadResults)

  const [lastRefreshed, setLastRefreshed] = useState(() => new Date().toLocaleTimeString())
  const [refreshing, setRefreshing] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [logError, setLogError] = useState('')
  const [connectionMessage, setConnectionMessage] = useState('')
  const [connectionFailed, setConnectionFailed] = useState(false)

  // Silent refreshes keep the terminal steady; only the manual button shows a spinner.
  const refreshResults = useCallback(async (silent: boolean) => {
    if (!silent) setRefreshing(true)
    try {
      const fresh = await getProjectResults(projectId)
      setResults(fresh)
      setLastRefreshed(new Date().toLocaleTimeString())
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [projectId, setResults])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshResults(true)
    }, AUTO_REFRESH_MS)
    return () => window.clearInterval(interval)
  }, [refreshResults])

  useEffect(() => {
    if (!runMonitorId || startedMonitorRef.current === runMonitorId) return
    startedMonitorRef.current = runMonitorId
    const cleanQuery = new URLSearchParams(searchParams)
    cleanQuery.delete('runMonitorId')
    cleanQuery.delete('monitorName')
    setSearchParams(cleanQuery, { replace: true })
    setConnectionFailed(false)
    setConnectionMessage(`Connecting to ${runMonitorName} and waiting for the first response...`)
    testMonitor(runMonitorId)
      .then(result => {
        setResults(current => {
          const existing = current ?? []
          return [result, ...existing.filter(item => item.id !== result.id)]
        })
        setSelectedId(result.id)
        setLastRefreshed(new Date().toLocaleTimeString())
        setConnectionFailed(result.outcome !== 'success')
        setConnectionMessage(result.outcome === 'success' ? `${runMonitorName} connected successfully.` : `${runMonitorName} responded with a failed first check.`)
      })
      .catch(cause => {
        setConnectionFailed(true)
        setConnectionMessage(cause instanceof Error ? cause.message : 'Unable to run the first monitor check.')
      })
  }, [runMonitorId, runMonitorName, searchParams, setResults, setSearchParams])

  function handleRefreshClick() {
    void refreshResults(false)
  }

  function handleSelectClick(event: MouseEvent<HTMLButtonElement>) {
    setSelectedId(event.currentTarget.dataset.resultId ?? '')
  }

  function handleCloseDetail() { setSelectedId('') }

  async function handleDeleteClick(event: MouseEvent<HTMLButtonElement>) {
    const id = event.currentTarget.dataset.resultId ?? ''
    if (!id) return
    setLogError('')
    try {
      await deleteResult(id)
      setResults(current => (current ? current.filter(item => item.id !== id) : current))
      if (selectedId === id) setSelectedId('')
    } catch (cause) {
      setLogError(cause instanceof Error ? cause.message : 'Unable to delete log entry.')
    }
  }

  function handleClearClick() { setConfirmClear(true) }
  function handleClearCancel() { setConfirmClear(false) }

  async function handleClearConfirm() {
    setClearing(true)
    setLogError('')
    try {
      await clearProjectResults(projectId)
      setResults([])
      setSelectedId('')
      setLastRefreshed(new Date().toLocaleTimeString())
      setConfirmClear(false)
    } catch (cause) {
      setLogError(cause instanceof Error ? cause.message : 'Unable to clear the log.')
    } finally {
      setClearing(false)
    }
  }

  function renderLine(result: CheckResult, index: number) {
    const isSuccess = result.outcome === 'success'
    const selected = result.id === selectedId
    return (
      <li key={result.id} className={`${logStyles.classes.entry} ${isSuccess ? logStyles.classes.entry_success : logStyles.classes.entry_error}`}>
        <button className={`${logStyles.classes.lineButton} ${selected ? logStyles.classes.lineButtonSelected : ''}`} type="button" data-result-id={result.id} onClick={handleSelectClick} aria-pressed={selected}>
          <span className={logStyles.classes.time}>{index + 1}</span>
          <span className={logStyles.classes.message}>{formatResult(result)}</span>
        </button>
        <button className={logStyles.classes.lineDelete} type="button" data-result-id={result.id} onClick={handleDeleteClick} aria-label={`Delete log entry ${index + 1}`}><Trash2 size={11} /></button>
      </li>
    )
  }

  if (projectResource.loading || resultsLoading) return <LoadingPanel />
  if (projectResource.error || !projectResource.data) return <ErrorPanel message={projectResource.error} />
  if (resultsError || !results) return <ErrorPanel message={resultsError} />

  const detail = projectResource.data
  const selectedResult = results.find(item => item.id === selectedId) ?? null

  const actions = (
    <>
      <Link className={dashboardStyles.classes.secondaryButton} to={`/app/projects/${projectId}`}><ArrowLeft size={14} />Back to project</Link>
      <button className={dashboardStyles.classes.primaryButton} type="button" onClick={handleRefreshClick} disabled={refreshing}>{refreshing ? 'Refreshing...' : 'Refresh'}</button>
    </>
  )

  return (
    <>
      <PageHeader
        eyebrow="Request log"
        title={`${detail.project.name} · request log`}
        description="Live terminal view of all checks for this project. Select a line to inspect headers, request, timing, and response. Logs auto-refresh every 10 seconds."
        actions={actions}
      />
      <div className={logStyles.classes.layout}>
        <section className={logStyles.classes.listPanel} aria-label="Project request log">
          <header className={logStyles.classes.header}>
            <div>
              <h2 className={logStyles.classes.title}>Full check log</h2>
              <p className={logStyles.classes.subtitle}>{results.length} checks · last refreshed {lastRefreshed}</p>
            </div>
            <div className={logStyles.classes.headerActions}>
              {confirmClear ? (
                <>
                  <button className={`${dashboardStyles.classes.primaryButton} ${formStyles.classes.dangerButton}`} type="button" onClick={handleClearConfirm} disabled={clearing}><Trash2 size={14} />{clearing ? 'Clearing...' : 'Confirm clear'}</button>
                  <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleClearCancel} disabled={clearing}>Cancel</button>
                </>
              ) : (
                <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleClearClick} disabled={results.length === 0}><Trash2 size={14} />Clear log</button>
              )}
            </div>
          </header>
          {connectionMessage ? <p className={`${logStyles.classes.connection} ${connectionFailed ? logStyles.classes.connectionError : ''}`} role="status">{connectionMessage}</p> : null}
          {logError ? <p className={formStyles.classes.danger} role="alert">{logError}</p> : null}
          {results.length === 0 ? (
            <p className={logStyles.classes.empty}>No checks yet. Deploy a monitor to start logging.</p>
          ) : (
            <ul className={logStyles.classes.fullList}>
              {results.map(renderLine)}
            </ul>
          )}
        </section>
        {selectedResult ? <LogDetailPanel result={selectedResult} onClose={handleCloseDetail} /> : null}
      </div>
    </>
  )
}
