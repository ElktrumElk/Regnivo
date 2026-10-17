import { useCallback, useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { ExternalLink, Play, RefreshCw, Repeat2, Unplug } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { RenderConnectPanel } from '../components/RenderConnectPanel.tsx'
import { disconnectRender, getRenderIntegration, getRenderService, getRenderServices, restartRenderService, triggerRenderDeploy } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { integrationStyles } from '../styles/integrationStyles.ts'
import type { RenderDeploy, RenderEndpoint, RenderService, RenderServiceDetail } from '../types/api.ts'

const ACTIVE_DEPLOY_STATES = new Set(['created', 'queued', 'build_in_progress', 'pre_deploy_in_progress', 'update_in_progress'])

interface RenderOverview { configured: boolean; services: RenderService[] }

async function loadOverview(): Promise<RenderOverview> {
  const status = await getRenderIntegration()
  if (!status.configured) return { configured: false, services: [] }
  return { configured: true, services: await getRenderServices() }
}

function monitorURL(serviceId: string, endpoint: string): string {
  const query = new URLSearchParams({ renderServiceId: serviceId, endpoint })
  return `/app/monitors/new?${query.toString()}`
}

function shortCommit(deploy: RenderDeploy | undefined): string {
  return deploy?.commit?.id ? deploy.commit.id.slice(0, 8) : 'No commit'
}

export function RenderIntegrationPage() {
  const { data: overview, error, loading, setData } = useResource(loadOverview)
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState<RenderServiceDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState('')
  const [action, setAction] = useState('')
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const activeServiceId = selectedId || overview?.services[0]?.id || ''

  async function handleConnected() {
    try {
      setData({ configured: true, services: await getRenderServices() })
    } catch (cause) {
      setData({ configured: true, services: [] })
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : 'Render connected, but services could not be loaded.')
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    setMessage('')
    setMessageError(false)
    try {
      await disconnectRender()
      setDetail(null)
      setSelectedId('')
      setData({ configured: false, services: [] })
    } catch (cause) {
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : 'Unable to disconnect Render.')
    } finally {
      setDisconnecting(false)
    }
  }

  const refreshDetail = useCallback(async () => {
    if (!activeServiceId) return
    try {
      setDetail(await getRenderService(activeServiceId))
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to load Render service.')
    } finally {
      setDetailLoading(false)
    }
  }, [activeServiceId])

  useEffect(() => {
    if (!activeServiceId) return
    let active = true
    getRenderService(activeServiceId)
      .then(service => { if (active) setDetail(service) })
      .catch(cause => { if (active) setDetailError(cause instanceof Error ? cause.message : 'Unable to load Render service.') })
      .finally(() => { if (active) setDetailLoading(false) })
    return () => { active = false }
  }, [activeServiceId])

  const latestStatus = detail?.latestDeploy?.status ?? ''
  useEffect(() => {
    if (!ACTIVE_DEPLOY_STATES.has(latestStatus)) return
    const timer = window.setInterval(() => { void refreshDetail() }, 5000)
    return () => window.clearInterval(timer)
  }, [latestStatus, refreshDetail])

  function handleServiceClick(event: MouseEvent<HTMLButtonElement>) {
    setSelectedId(event.currentTarget.dataset.serviceId ?? '')
    setDetail(null)
    setDetailLoading(true)
    setDetailError('')
    setMessage('')
  }

  async function runDeploy(mode: 'build_and_deploy' | 'deploy_only') {
    if (!activeServiceId) return
    setAction(mode)
    setMessage('')
    setMessageError(false)
    try {
      const deploy = await triggerRenderDeploy(activeServiceId, mode)
      setMessage(deploy.id ? `Deploy ${deploy.id} queued.` : 'Deploy queued by Render.')
      await refreshDetail()
    } catch (cause) {
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : 'Unable to trigger deployment.')
    } finally {
      setAction('')
    }
  }

  function handleDeploy() { void runDeploy('build_and_deploy') }
  function handleRedeploy() { void runDeploy('deploy_only') }

  async function handleRestart() {
    if (!activeServiceId) return
    setAction('restart')
    setMessage('')
    setMessageError(false)
    try {
      await restartRenderService(activeServiceId)
      setMessage('Service restart accepted by Render.')
      await refreshDetail()
    } catch (cause) {
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : 'Unable to restart service.')
    } finally {
      setAction('')
    }
  }

  function renderService(service: RenderService) {
    const active = service.id === activeServiceId
    return (
      <button key={service.id} className={`${integrationStyles.classes.serviceButton} ${active ? integrationStyles.classes.serviceButtonActive : ''}`} type="button" data-service-id={service.id} onClick={handleServiceClick}>
        <span className={integrationStyles.classes.serviceName}>{service.name}</span>
        <span className={integrationStyles.classes.serviceMeta}>{service.type.replaceAll('_', ' ')} · {service.serviceDetails.region ?? 'Render'}</span>
      </button>
    )
  }

  function renderEndpoint(endpoint: RenderEndpoint) {
    return (
      <div key={`${endpoint.kind}-${endpoint.url}`} className={integrationStyles.classes.endpoint}>
        <div className={integrationStyles.classes.endpointInfo}>
          <strong className={integrationStyles.classes.endpointLabel}>{endpoint.label}</strong>
          <span className={integrationStyles.classes.endpointUrl}>{endpoint.url}</span>
        </div>
        <Link className={dashboardStyles.classes.secondaryButton} to={monitorURL(activeServiceId, endpoint.url)}>Monitor API</Link>
      </div>
    )
  }

  function renderDeploy(deploy: RenderDeploy) {
    return (
      <div key={deploy.id ?? `${deploy.createdAt}-${deploy.status}`} className={integrationStyles.classes.deploy}>
        <div className={integrationStyles.classes.deployInfo}>
          <strong className={integrationStyles.classes.deployCommit}>{deploy.commit?.message ?? deploy.image?.ref ?? 'Render deployment'}</strong>
          <span className={integrationStyles.classes.deployMeta}>{shortCommit(deploy)} · {deploy.trigger ?? 'unknown trigger'} · {deploy.createdAt ? new Date(deploy.createdAt).toLocaleString() : 'time unavailable'}</span>
        </div>
        <span className={`${integrationStyles.classes.status} ${ACTIVE_DEPLOY_STATES.has(deploy.status ?? '') ? integrationStyles.classes.statusBusy : ''}`}>{deploy.status ?? 'unknown'}</span>
      </div>
    )
  }

  if (loading) return <LoadingPanel />
  if (error || !overview) return <ErrorPanel message={error} />

  if (!overview.configured) {
    return (
      <>
        <PageHeader eyebrow="Service" title="Render" description="Connect your own Render account. Credentials stay on the server, encrypted per user." />
        <RenderConnectPanel onConnected={handleConnected} />
      </>
    )
  }

  const disconnectAction = <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleDisconnect} disabled={disconnecting}><Unplug size={14} />{disconnecting ? 'Disconnecting...' : 'Disconnect'}</button>

  return (
    <>
      <PageHeader eyebrow="Service" title="Render services" description="Inspect services and commits, trigger deployments, restart live services, and create endpoint monitors directly from Render URLs." actions={disconnectAction} />
      {message ? <p className={messageError ? integrationStyles.classes.error : integrationStyles.classes.notice} role="status">{message}</p> : null}
      <div className={integrationStyles.classes.layout}>
        <aside className={integrationStyles.classes.services} aria-label="Render services">
          <h2 className={integrationStyles.classes.sectionTitle}>Services</h2>
          {overview.services.length > 0 ? overview.services.map(renderService) : <p className={integrationStyles.classes.empty}>No Render services found.</p>}
        </aside>
        <div className={integrationStyles.classes.detail}>
          {activeServiceId && detailLoading && !detail ? <LoadingPanel /> : null}
          {detailError ? <p className={integrationStyles.classes.error} role="alert">{detailError}</p> : null}
          {detail ? (
            <>
              <section className={integrationStyles.classes.card}>
                <header className={integrationStyles.classes.cardHeader}>
                  <div>
                    <h2 className={integrationStyles.classes.title}>{detail.service.name}</h2>
                    <p className={integrationStyles.classes.subtitle}>{detail.service.repo ?? detail.service.serviceDetails.url ?? detail.service.id}</p>
                  </div>
                  <span className={`${integrationStyles.classes.status} ${ACTIVE_DEPLOY_STATES.has(latestStatus) ? integrationStyles.classes.statusBusy : ''}`}>{latestStatus || detail.service.suspended || 'ready'}</span>
                </header>
                <div className={integrationStyles.classes.actions}>
                  <button className={dashboardStyles.classes.primaryButton} type="button" onClick={handleDeploy} disabled={action !== ''}><Play size={14} />{action === 'build_and_deploy' ? 'Deploying...' : 'Deploy latest'}</button>
                  <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleRedeploy} disabled={action !== ''}><Repeat2 size={14} />{action === 'deploy_only' ? 'Redeploying...' : 'Redeploy live build'}</button>
                  <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleRestart} disabled={action !== ''}><RefreshCw size={14} />{action === 'restart' ? 'Restarting...' : 'Restart service'}</button>
                  {detail.service.dashboardUrl ? <a className={dashboardStyles.classes.secondaryButton} href={detail.service.dashboardUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} />Render dashboard</a> : null}
                </div>
                {message ? <p className={messageError ? integrationStyles.classes.error : integrationStyles.classes.notice} role="status">{message}</p> : null}
              </section>

              <section className={integrationStyles.classes.card}>
                <h3 className={integrationStyles.classes.sectionTitle}>Service info</h3>
                <div className={integrationStyles.classes.facts}>
                  <div className={integrationStyles.classes.fact}><span className={integrationStyles.classes.factLabel}>Type</span><strong className={integrationStyles.classes.factValue}>{detail.service.type.replaceAll('_', ' ')}</strong></div>
                  <div className={integrationStyles.classes.fact}><span className={integrationStyles.classes.factLabel}>Runtime</span><strong className={integrationStyles.classes.factValue}>{detail.service.serviceDetails.runtime ?? 'Not reported'}</strong></div>
                  <div className={integrationStyles.classes.fact}><span className={integrationStyles.classes.factLabel}>Region</span><strong className={integrationStyles.classes.factValue}>{detail.service.serviceDetails.region ?? 'Not reported'}</strong></div>
                  <div className={integrationStyles.classes.fact}><span className={integrationStyles.classes.factLabel}>Branch</span><strong className={integrationStyles.classes.factValue}>{detail.service.branch ?? 'Not reported'}</strong></div>
                  <div className={integrationStyles.classes.fact}><span className={integrationStyles.classes.factLabel}>Latest commit</span><strong className={integrationStyles.classes.factValue}>{shortCommit(detail.latestDeploy)} · {detail.latestDeploy?.commit?.message ?? 'No commit metadata'}</strong></div>
                </div>
              </section>

              <section className={integrationStyles.classes.card}>
                <h3 className={integrationStyles.classes.sectionTitle}>Public APIs and endpoints</h3>
                <div className={integrationStyles.classes.endpoints}>{detail.endpoints.length > 0 ? detail.endpoints.map(renderEndpoint) : <p className={integrationStyles.classes.empty}>This service has no public HTTPS endpoint.</p>}</div>
              </section>

              <section className={integrationStyles.classes.card}>
                <h3 className={integrationStyles.classes.sectionTitle}>Recent deploys</h3>
                <div className={integrationStyles.classes.deploys}>{detail.deploys.length > 0 ? detail.deploys.map(renderDeploy) : <p className={integrationStyles.classes.empty}>No deploy history returned.</p>}</div>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}
