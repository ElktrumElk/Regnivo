import { useState } from 'react'
import type { FormEvent } from 'react'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { getSettings, updateSettings } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'

export function SettingsPage() {
  const { data, error, loading, setData } = useResource(getSettings)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    try {
      const updated = await updateSettings({ name: String(values.get('name')), timezone: String(values.get('timezone')), defaultIntervalSeconds: Number(values.get('defaultIntervalSeconds')), pauseAll: values.get('pauseAll') === 'on' })
      setData(updated)
      setMessage('Preferences saved.')
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to save preferences.') }
  }

  if (loading) return <LoadingPanel />
  if (error || !data) return <ErrorPanel message={error} />

  return (
    <>
      <PageHeader eyebrow="Account preferences" title="Settings" description="Control display defaults and monitoring behavior. Raw request results are retained for 30 days." />
      <section className={formStyles.classes.card}><form className={formStyles.classes.form} onSubmit={handleSubmit}>
        <div className={formStyles.classes.row}><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="settings-name">Display name</label><input className={formStyles.classes.input} id="settings-name" name="name" defaultValue={data.name} required /></div><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="settings-email">Email</label><input className={formStyles.classes.input} id="settings-email" value={data.email} disabled readOnly /></div></div>
        <div className={formStyles.classes.row}><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="settings-timezone">Time zone</label><select className={formStyles.classes.input} id="settings-timezone" name="timezone" defaultValue={data.timezone}><option value="UTC">UTC</option><option value="America/New_York">America/New_York</option><option value="Europe/London">Europe/London</option><option value="Africa/Lagos">Africa/Lagos</option></select></div><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="settings-interval">Default interval</label><select className={formStyles.classes.input} id="settings-interval" name="defaultIntervalSeconds" defaultValue={data.defaultIntervalSeconds}><option value="60">1 minute</option><option value="300">5 minutes</option><option value="600">10 minutes</option><option value="1800">30 minutes</option></select></div></div>
        <label className={formStyles.classes.checkboxRow}><span><strong className={formStyles.classes.label}>Pause all monitoring</strong><p className={formStyles.classes.hint}>Stops scheduled checks without deleting projects or history.</p></span><input className={formStyles.classes.checkbox} type="checkbox" name="pauseAll" defaultChecked={data.pauseAll} /></label>
        <div className={formStyles.classes.actions}><button className={dashboardStyles.classes.primaryButton} type="submit">Save preferences</button>{message ? <p className={formStyles.classes.message} role="status">{message}</p> : null}</div>
      </form></section>
    </>
  )
}
