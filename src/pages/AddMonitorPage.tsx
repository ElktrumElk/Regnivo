import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { createMonitor, getProjects } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import type { Project } from '../types/api.ts'

function renderProjectOption(project: Project) { return <option key={project.id} value={project.id}>{project.name}</option> }

export function AddMonitorPage() {
  const { data: projects, error, loading } = useResource(getProjects)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  function goToProjects() { navigate('/app/projects') }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const values = new FormData(event.currentTarget)
    try {
      await createMonitor(String(values.get('projectId')), {
        name: String(values.get('name')),
        url: String(values.get('url')),
        method: String(values.get('method')) as 'GET' | 'HEAD',
        intervalSeconds: Number(values.get('intervalSeconds')),
        timeoutMs: Number(values.get('timeoutMs')),
        expectedStatus: [Number(values.get('expectedStatus'))],
        enabled: values.get('enabled') === 'on',
      })
      setMessage('Monitor deployed. Its first check is now scheduled.')
      event.currentTarget.reset()
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to deploy monitor.') }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingPanel />
  if (error || !projects) return <ErrorPanel message={error} />
  if (projects.length === 0) return <><PageHeader eyebrow="Monitor deployment" title="Add monitor" description="Create a project before registering an endpoint." /><button className={dashboardStyles.classes.primaryButton} type="button" onClick={goToProjects}>Create project</button></>

  return (
    <>
      <PageHeader eyebrow="Monitor deployment" title="Add endpoint" description="Register an existing public HTTPS endpoint. ServerPulse validates the destination before saving and before every check." />
      <section className={formStyles.classes.card}>
        <form className={formStyles.classes.form} onSubmit={handleSubmit}>
          <div className={formStyles.classes.row}><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="monitor-project">Project</label><select className={formStyles.classes.input} id="monitor-project" name="projectId" required>{projects.map(renderProjectOption)}</select></div><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="monitor-name">Endpoint name</label><input className={formStyles.classes.input} id="monitor-name" name="name" placeholder="API health" required maxLength={100} /></div></div>
          <div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="monitor-url">Target URL</label><input className={formStyles.classes.input} id="monitor-url" name="url" type="url" placeholder="https://api.example.com/health" pattern="https://.*" required /><p className={formStyles.classes.hint}>HTTPS only. Private, loopback, metadata, reserved, and credential-bearing destinations are blocked.</p></div>
          <div className={formStyles.classes.row}><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="monitor-method">Request method</label><select className={formStyles.classes.input} id="monitor-method" name="method"><option value="GET">GET</option><option value="HEAD">HEAD</option></select></div><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="monitor-interval">Check interval</label><select className={formStyles.classes.input} id="monitor-interval" name="intervalSeconds" defaultValue="600"><option value="300">Every 5 minutes</option><option value="600">Every 10 minutes</option><option value="1800">Every 30 minutes</option><option value="3600">Every hour</option></select></div></div>
          <div className={formStyles.classes.row}><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="monitor-timeout">Timeout</label><select className={formStyles.classes.input} id="monitor-timeout" name="timeoutMs" defaultValue="10000"><option value="5000">5 seconds</option><option value="10000">10 seconds</option><option value="20000">20 seconds</option></select></div><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="monitor-status">Expected status</label><input className={formStyles.classes.input} id="monitor-status" name="expectedStatus" type="number" min="100" max="599" defaultValue="200" /></div></div>
          <label className={formStyles.classes.checkboxRow}><span><strong className={formStyles.classes.label}>Activate monitoring</strong><p className={formStyles.classes.hint}>Schedule server-side checks immediately after deployment.</p></span><input className={formStyles.classes.checkbox} type="checkbox" name="enabled" defaultChecked /></label>
          <div className={formStyles.classes.actions}><button className={dashboardStyles.classes.primaryButton} type="submit" disabled={saving}>{saving ? 'Validating target...' : 'Deploy monitor'}</button>{message ? <p className={message.includes('deployed') ? formStyles.classes.message : formStyles.classes.danger} role="status">{message}</p> : null}</div>
        </form>
      </section>
    </>
  )
}
