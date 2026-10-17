import { useState } from 'react'
import type { FormEvent } from 'react'
import { Cloud } from 'lucide-react'
import { connectRender } from '../services/api.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { integrationStyles } from '../styles/integrationStyles.ts'

interface RenderConnectPanelProps { onConnected: () => void }

export function RenderConnectPanel({ onConnected }: RenderConnectPanelProps) {
  const [apiKey, setApiKey] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  function handleApiKeyChange(event: { target: HTMLInputElement }) { setApiKey(event.target.value) }
  function handleOwnerIdChange(event: { target: HTMLInputElement }) { setOwnerId(event.target.value) }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setFailed(false)
    try {
      await connectRender({ apiKey: apiKey.trim(), ownerId: ownerId.trim() })
      setApiKey('')
      setOwnerId('')
      onConnected()
    } catch (cause) {
      setFailed(true)
      setMessage(cause instanceof Error ? cause.message : 'Unable to connect Render.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={integrationStyles.classes.card}>
      <div className={integrationStyles.classes.cardHeader}>
        <div>
          <h2 className={integrationStyles.classes.title}>Connect your Render account</h2>
          <p className={integrationStyles.classes.subtitle}>The API key is stored encrypted on the server and is never returned to the browser.</p>
        </div>
        <span className={integrationStyles.classes.providerIcon}><Cloud size={17} aria-hidden="true" /></span>
      </div>
      <form className={integrationStyles.classes.form} onSubmit={handleSubmit}>
        <div className={integrationStyles.classes.field}>
          <label className={integrationStyles.classes.label} htmlFor="render-api-key">Render API key</label>
          <input className={integrationStyles.classes.input} id="render-api-key" type="password" autoComplete="off" required maxLength={512} value={apiKey} onChange={handleApiKeyChange} />
          <p className={integrationStyles.classes.hint}>Create one in Render under Account Settings &rarr; API Keys.</p>
        </div>
        <div className={integrationStyles.classes.field}>
          <label className={integrationStyles.classes.label} htmlFor="render-owner-id">Workspace ID (optional)</label>
          <input className={integrationStyles.classes.input} id="render-owner-id" type="text" autoComplete="off" maxLength={100} value={ownerId} onChange={handleOwnerIdChange} />
          <p className={integrationStyles.classes.hint}>Limits results to a single Render workspace. Leave blank to use every workspace the key can access.</p>
        </div>
        {message ? <p className={failed ? integrationStyles.classes.error : integrationStyles.classes.notice} role="alert">{message}</p> : null}
        <div className={integrationStyles.classes.actions}>
          <button className={dashboardStyles.classes.primaryButton} type="submit" disabled={submitting}>{submitting ? 'Connecting...' : 'Connect Render'}</button>
        </div>
      </form>
    </section>
  )
}
