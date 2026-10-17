import { useState } from 'react'
import type { FormEvent } from 'react'
import { connectIntegration } from '../services/api.ts'
import type { ProviderConfig } from '../services/providers.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { integrationStyles } from '../styles/integrationStyles.ts'

interface IntegrationConnectPanelProps {
  provider: ProviderConfig
  onConnected: () => void
}

export function IntegrationConnectPanel({ provider, onConnected }: IntegrationConnectPanelProps) {
  const [credential, setCredential] = useState('')
  const [scopeId, setScopeId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const ProviderIcon = provider.icon

  function handleCredentialChange(event: { target: HTMLInputElement }) {
    setCredential(event.target.value)
  }

  function handleScopeChange(event: { target: HTMLInputElement }) {
    setScopeId(event.target.value)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setFailed(false)
    try {
      await connectIntegration(provider.id, { credential: credential.trim(), scopeId: scopeId.trim() })
      setCredential('')
      setScopeId('')
      onConnected()
    } catch (cause) {
      setFailed(true)
      setMessage(cause instanceof Error ? cause.message : `Unable to connect ${provider.name}.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={integrationStyles.classes.card}>
      <div className={integrationStyles.classes.cardHeader}>
        <div>
          <h2 className={integrationStyles.classes.title}>Connect your {provider.name} account</h2>
          <p className={integrationStyles.classes.subtitle}>The credential is stored encrypted on the server and is never returned to the browser.</p>
        </div>
        <span className={integrationStyles.classes.providerIcon}><ProviderIcon size={17} aria-hidden="true" /></span>
      </div>
      <form className={integrationStyles.classes.form} onSubmit={handleSubmit}>
        <div className={integrationStyles.classes.field}>
          <label className={integrationStyles.classes.label} htmlFor="integration-credential">{provider.credentialLabel}</label>
          <input className={integrationStyles.classes.input} id="integration-credential" type="password" autoComplete="off" required maxLength={512} value={credential} onChange={handleCredentialChange} />
          <p className={integrationStyles.classes.hint}>{provider.credentialHint}</p>
        </div>
        <div className={integrationStyles.classes.field}>
          <label className={integrationStyles.classes.label} htmlFor="integration-scope">{provider.scopeLabel}</label>
          <input className={integrationStyles.classes.input} id="integration-scope" type="text" autoComplete="off" maxLength={100} value={scopeId} onChange={handleScopeChange} />
          <p className={integrationStyles.classes.hint}>{provider.scopeHint}</p>
        </div>
        {message ? <p className={failed ? integrationStyles.classes.error : integrationStyles.classes.notice} role="alert">{message}</p> : null}
        <div className={integrationStyles.classes.actions}>
          <button className={dashboardStyles.classes.primaryButton} type="submit" disabled={submitting}>{submitting ? 'Connecting...' : `Connect ${provider.name}`}</button>
        </div>
      </form>
    </section>
  )
}
