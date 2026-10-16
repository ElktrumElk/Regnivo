import { useCallback, useState } from 'react'
import type { ChangeEvent, FormEvent, MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Save, Trash2 } from 'lucide-react'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { deleteMonitor, deleteProject, getProject, updateProject } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import type { Project } from '../types/api.ts'

interface ConfigurationFormProps {
  project: Project
  monitorCount: number
}

// The form owns its local draft state; the parent keys it by project id so the
// fields re-seed whenever a different project is opened.
function ConfigurationForm({ project, monitorCount }: ConfigurationFormProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setSaveMessage('')
    try {
      await updateProject(project.id, { name, description })
      setSaveMessage('Project updated.')
    } catch (cause) {
      setSaveMessage(cause instanceof Error ? cause.message : 'Unable to update project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={`${formStyles.classes.card} ${formStyles.classes.stack}`} onSubmit={handleSave} aria-label="Project configuration">
      <div className={formStyles.classes.field}>
        <label className={formStyles.classes.label} htmlFor="project-name">Project name</label>
        <input className={formStyles.classes.input} id="project-name" value={name} onChange={handleNameChange} />
      </div>
      <div className={formStyles.classes.field}>
        <label className={formStyles.classes.label} htmlFor="project-description">Description</label>
        <textarea className={formStyles.classes.textarea} id="project-description" value={description} onChange={handleDescriptionChange} placeholder="What does this project monitor?" />
      </div>
      <div className={formStyles.classes.field}>
        <span className={formStyles.classes.label}>Monitors attached</span>
        <p className={formStyles.classes.hint}>{monitorCount} · created {new Date(project.createdAt).toLocaleString()}</p>
      </div>
      {saveMessage ? <p className={formStyles.classes.statusMessage} role="status">{saveMessage}</p> : null}
      <div className={formStyles.classes.actions}>
        <button className={dashboardStyles.classes.primaryButton} type="submit" disabled={saving}><Save size={14} />{saving ? 'Saving...' : 'Save changes'}</button>
      </div>
    </form>
  )
}

export function ProjectSettingsPage() {
  const params = useParams()
  const projectId = params.projectId ?? ''
  const navigate = useNavigate()

  const loadProject = useCallback(() => getProject(projectId), [projectId])
  const { data: detail, error, loading, setData } = useResource(loadProject)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [pendingRemoveId, setPendingRemoveId] = useState('')
  const [removingId, setRemovingId] = useState('')
  const [monitorError, setMonitorError] = useState('')

  function handleConfirmChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmText(event.target.value)
  }

  function handleMonitorRemoveClick(event: MouseEvent<HTMLButtonElement>) {
    setMonitorError('')
    setPendingRemoveId(event.currentTarget.dataset.monitorId ?? '')
  }

  function handleMonitorRemoveCancel() { setPendingRemoveId('') }

  async function handleMonitorRemoveConfirm(event: MouseEvent<HTMLButtonElement>) {
    const monitorId = event.currentTarget.dataset.monitorId ?? ''
    setRemovingId(monitorId)
    setMonitorError('')
    try {
      await deleteMonitor(monitorId)
      setData(current => (current ? { ...current, monitors: current.monitors.filter(item => item.id !== monitorId) } : current))
      setPendingRemoveId('')
    } catch (cause) {
      setMonitorError(cause instanceof Error ? cause.message : 'Unable to remove monitor.')
      setPendingRemoveId('')
    } finally {
      setRemovingId('')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteProject(projectId)
      navigate('/app/projects')
      return
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : 'Unable to delete project.')
      setDeleting(false)
    }
  }

  if (loading) return <LoadingPanel />
  if (error || !detail) return <ErrorPanel message={error} />

  const canDelete = confirmText === detail.project.name

  const actions = (
    <Link className={dashboardStyles.classes.secondaryButton} to={`/app/projects/${projectId}`}><ArrowLeft size={14} />Back to project</Link>
  )

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title={`${detail.project.name} · settings`}
        description="Configure this project or remove it along with its monitors and history."
        actions={actions}
      />

      <ConfigurationForm key={detail.project.id} project={detail.project} monitorCount={detail.monitors.length} />

      <section className={`${formStyles.classes.card} ${formStyles.classes.stack} ${formStyles.classes.cardSpaced}`} aria-label="Monitors">
        <div className={formStyles.classes.field}>
          <span className={formStyles.classes.label}>Monitors</span>
          <p className={formStyles.classes.hint}>Edit an endpoint's schedule, retries, and headers, or remove it entirely.</p>
        </div>
        {detail.monitors.length === 0 ? <p className={formStyles.classes.hint}>No monitors in this project yet.</p> : null}
        {detail.monitors.length > 0 ? (
          <div className={formStyles.classes.monitorsList}>
            {detail.monitors.map(monitor => (
              <div key={monitor.id} className={formStyles.classes.monitorRow}>
                <div className={formStyles.classes.monitorInfo}>
                  <p className={formStyles.classes.monitorName}>{monitor.name}</p>
                  <p className={formStyles.classes.hint}>{monitor.method} · {monitor.url} · {monitor.status}</p>
                </div>
                <div className={formStyles.classes.actions}>
                  <Link className={dashboardStyles.classes.secondaryButton} to={`/app/projects/${projectId}/monitors/${monitor.id}/edit`}><Pencil size={14} />Edit</Link>
                  {pendingRemoveId === monitor.id ? (
                    <>
                      <button className={`${dashboardStyles.classes.primaryButton} ${formStyles.classes.dangerButton}`} type="button" data-monitor-id={monitor.id} onClick={handleMonitorRemoveConfirm} disabled={removingId === monitor.id}><Trash2 size={14} />{removingId === monitor.id ? 'Removing...' : 'Confirm'}</button>
                      <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleMonitorRemoveCancel} disabled={removingId === monitor.id}>Cancel</button>
                    </>
                  ) : (
                    <button className={`${dashboardStyles.classes.primaryButton} ${formStyles.classes.dangerButton}`} type="button" data-monitor-id={monitor.id} onClick={handleMonitorRemoveClick}><Trash2 size={14} />Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {monitorError ? <p className={formStyles.classes.danger} role="alert">{monitorError}</p> : null}
      </section>

      <section className={`${formStyles.classes.card} ${formStyles.classes.stack} ${formStyles.classes.cardSpaced} ${formStyles.classes.dangerCard}`} aria-label="Danger zone">
        <div className={formStyles.classes.field}>
          <span className={formStyles.classes.label}>Delete project</span>
          <p className={formStyles.classes.hint}>Deleting this project removes all monitors and check history for this project. This action cannot be undone.</p>
        </div>
        <div className={formStyles.classes.field}>
          <label className={formStyles.classes.label} htmlFor="confirm-delete">Type the project name to confirm</label>
          <input className={formStyles.classes.input} id="confirm-delete" value={confirmText} onChange={handleConfirmChange} placeholder={detail.project.name} />
        </div>
        {deleteError ? <p className={formStyles.classes.danger} role="alert">{deleteError}</p> : null}
        <div className={formStyles.classes.actions}>
          <button className={`${dashboardStyles.classes.primaryButton} ${formStyles.classes.dangerButton}`} type="button" onClick={handleDelete} disabled={!canDelete || deleting}><Trash2 size={14} />{deleting ? 'Deleting...' : 'Delete project'}</button>
        </div>
      </section>
    </>
  )
}
