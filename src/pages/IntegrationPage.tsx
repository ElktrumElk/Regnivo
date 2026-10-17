import { useCallback, useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { ExternalLink, Play, Radar, RefreshCw, Repeat2, Unplug } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { IntegrationConnectPanel } from '../components/IntegrationConnectPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { detectIntegrationEndpoints, disconnectIntegration, getIntegration, getIntegrationService, getIntegrationServices, restartIntegrationService, triggerIntegrationDeploy } from '../services/api.ts'
import { providerById } from '../services/providers.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { integrationStyles } from '../styles/integrationStyles.ts'
import type { Deploy, DetectedEndpoint, Service, ServiceDetail, ServiceEndpoint } from '../types/api.ts'

const ACTIVE_DEPLOY_STATES = new Set(['created', 'queued', 'building', 'build_in_progress', 'initializing', 'pre_deploy_in_progress', 'update_in_progress'])

interface IntegrationOverview { configured: boolean; services: Service[] }

function monitorURL(provider: string, serviceId: string, endpoint: string): string {
  const query = new URLSearchParams({ provider, serviceId, endpoint })
  return `/app/monitors/new?${query.toString()}`
}

function shortCommit(deploy: Deploy | undefined): string {
  return deploy?.commit?.id ? deploy.commit.id.slice(0, 8) : 'No commit'
}

export function IntegrationPage() {
  const params = useParams()
  const provider = providerById(params.provider)

  const loadOverview = useCallback(async (): Promise<IntegrationOverview> => {
    if (!provider) return { configured: false, services: [] }
    const status = await getIntegration(provider.id)
    if (!status.configured) return { configured: false, services: [] }
    return { configured: true, services: await getIntegrationServices(provider.id) }
  }, [provider])

  const { data: overview, error, loading, setData } = useResource(loadOverview)
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState<ServiceDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState('')
  const [action, setAction] = useState('')
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [detected, setDetected] = useState<DetectedEndpoint[]>([])
  const [detectedRoot, setDetectedRoot] = useState('')

  const activeServiceId = selectedId || overview?.services[0]?.id || ''

  async function handleConnected() {
    if (!provider) return
    try {
      setData({ configured: true, services: await getIntegrationServices(provider.id) })
    } catch (cause) {
      setData({ configured: true, services: [] })
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : `${provider.name} connected, but services could not be loaded.`)
    }
  }

  async function handleDisconnect() {
    if (!provider) return
    setDisconnecting(true)
    setMessage('')
    setMessageError(false)
    try {
      await disconnectIntegration(provider.id)
      setDetail(null)
      setSelectedId('')
      setDetectedEndpointsState([])
      setData({ configured: false, services: [] })
    } catch (cause) {
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : `Unable to disconnect ${provider.name}.`)
    } finally {
      setDisconnecting(false)
    }
  }

  function setDetectedEndpointsState(endpoints: DetectedEndpoint[]) {
    setDetected(endpoints)
    if (endpoints.length === 0) setDetectedRoot('')
  }

  const refreshDetail = useCallback(async () => {
    if (!provider || !activeServiceId) return
    try {
      setDetail(await getIntegrationService(provider.id, activeServiceId, true))
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to load this service.')
    } finally {
      setDetailLoading(false)
    }
  }, [provider, activeServiceId])

  useEffect(() => {
    if (!provider || !activeServiceId) return
    let active = true
    getIntegrationService(provider.id, activeServiceId)
      .then(service => { if (active) setDetail(service) })
      .catch(cause => { if (active) setDetailError(cause instanceof Error ? cause.message : 'Unable to load this service.') })
      .finally(() => { if (active) setDetailLoading(false) })
    return () => { active = false }
  }, [provider, activeServiceId])

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
    setDetectedEndpointsState([])
  }

  async function runDeploy(mode: 'build_and_deploy' | 'deploy_only') {
    if (!provider || !activeServiceId) return
    setAction(mode)
    setMessage('')
    setMessageError(false)
    try {
      const deploy = await triggerIntegrationDeploy(provider.id, activeServiceId, mode)
      setMessage(deploy.id ? `Deploy ${deploy.id} queued.` : 'Deploy queued.')
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
    if (!provider || !activeServiceId) return
    setAction('restart')
    setMessage('')
    setMessageError(false)
    try {
      await restartIntegrationService(provider.id, activeServiceId)
      setMessage('Restart requested.')
      await refreshDetail()
    } catch (cause) {
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : 'Unable to restart service.')
    } finally {
      setAction('')
    }
  }

  async function handleDetect() {
    if (!provider || !activeServiceId) return
    setAction('detect')
    setMessage('')
    setMessageError(false)
    try {
      const result = await detectIntegrationEndpoints(provider.id, activeServiceId)
      setDetected(result.endpoints)
      setDetectedRoot(result.root)
      setMessage(result.endpoints.length > 0 ? `Discovered ${result.endpoints.length} reachable endpoint${result.endpoints.length === 1 ? '' : 's'}.` : 'No reachable endpoints were found.')
    } catch (cause) {
      setMessageError(true)
      setMessage(cause instanceof Error ? cause.message : 'Unable to scan endpoints.')
    } finally {
      setAction('')
    }
  }

  function renderService(service: Service) {
    return (
      <button key={service.id} className={integrationStyles.classes.serviceButton} data-service-id={service.id} type="button" onClick={handleServiceClick}>
        <strong className={integrationStyles.classes.serviceMeta}>{service.name}</strong>
        <span className={integrationStyles.classes.serviceMeta}>{service.type.replaceAll('_', ' ')}</span>
      </button>
    )
  }

  function renderEndpoint(endpoint: ServiceEndpoint) {
    return (
      <div key={`${endpoint.kind}-${endpoint.url}`} className={integrationStyles.classes.endpoint}>
        <div className={integrationStyles.classes.endpointInfo}>
          <strong className={integrationStyles.classes.endpointLabel}>{endpoint.label}</strong>
          <span className={integrationStyles.classes.endpointUrl}>{endpoint.url}</span>
        </div>
        <Link className={dashboardStyles.classes.secondaryButton} to={monitorURL(provider?.id ?? '', activeServiceId, endpoint.url)}>Monitor API</Link>
      </div>
    )
  }

  function renderDetected(endpoint: DetectedEndpoint) {
    return (
      <div key={`${endpoint.method}-${endpoint.url}`} className={integrationStyles.classes.endpoint}>
        <div className={integrationStyles.classes.endpointInfo}>
          <div className={integrationStyles.classes.endpointMeta}>
            <span className={integrationStyles.classes.methodBadge}>{endpoint.method}</span>
            <strong className={integrationStyles.classes.endpointLabel}>{endpoint.label}</strong>
            {endpoint.status > 0 ? <span className={integrationStyles.classes.endpointStatus}>HTTP {endpoint.status}</span> : null}
          </div>
          <span className={integrationStyles.classes.endpointUrl}>{endpoint.url}</span>
        </div>
        <Link className={dashboardStyles.classes.secondaryButton} to={monitorURL(provider?.id ?? '', activeServiceId, endpoint.url)}>Monitor API</Link>
      </div>
    )
  }

  function renderDeploy(deploy: Deploy) {
    return (
      <div key={deploy.id ?? `${deploy.createdAt}-${deploy.status}`} className={integrationStyles.classes.deploy}>
        <div className={integrationStyles.classes.deployInfo}>
          <strong className={integrationStyles.classes.deployCommit}>{deploy.commit?.message ?? deploy.image?.ref ?? 'Deployment'}</strong>
          <span className={integrationStyles.classes.deployMeta}>{shortCommit(deploy)} · {deploy.trigger ?? 'unknown trigger'} · {deploy.createdAt ? new Date(deploy.createdAt).toLocaleString() : 'time unavailable'}</span>
        </div>
        <span className={`${integrationStyles.classes.status} ${ACTIVE_DEPLOY_STATES.has(deploy.status ?? '') ? integrationStyles.classes.statusBusy : ''}`}>{deploy.status ?? 'unknown'}</span>
      </div>
    )
  }

  if (!provider) return <ErrorPanel message="Unknown integration provider." />

  if (loading) return <LoadingPanel />
  if (error || !overview) return <ErrorPanel message={error} />

  if (!overview.configured) {
    return (
      <>
        <PageHeader eyebrow="Service" title={provider.name} description={`Connect your own ${provider.name} account. Credentials stay on the server, encrypted per user.`} />
        <IntegrationConnectPanel provider={provider} onConnected={handleConnected} />
      </>
    )
  }

  const disconnectAction = <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleDisconnect} disabled={disconnecting}><Unplug size={14} />{disconnecting ? 'Disconnecting...' : 'Disconnect'}</button>

  return (
    <>
      <PageHeader eyebrow="Service" title={provider.name} description={`Inspect projects, redeploy builds, restart deployments, and create monitors from live ${provider.name} URLs.`} actions={disconnectAction} />
      {message ? <p className={messageError ? integrationStyles.classes.error : integrationStyles.classes.notice} role="status">{message}</p> : null}
      <div className={integrationStyles.classes.layout}>
        <aside className={integrationStyles.classes.services} aria-label={`${provider.name} services`}>
          <h2 className={integrationStyles.classes.sectionTitle}>Services</h2>
          {overview.services.length > 0 ? overview.services.map(renderService) : <p className={integrationStyles.classes.empty}>No services found.</p>}
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
                  <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleRedeploy} disabled={action !== ''}><Repeat2 size={14} />{action === 'deploy_only' ? 'Redeploying...' : 'Redeploy build'}</button>
                  <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleRestart} disabled={action !== ''}><RefreshCw size={14} />{action === 'restart' ? 'Restarting...' : 'Restart service'}</button>
                  {detail.service.dashboardUrl ? <a className={dashboardStyles.classes.secondaryButton} href={detail.service.dashboardUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} />Dashboard</a> : null}
                </div>
              </section>

              <section className={integrationStyles.classes.card}>
                <header className={integrationStyles.classes.sectionHeader}>
                  <h3 className={integrationStyles.classes.sectionHeading}>Public APIs and endpoints</h3>
                  <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleDetect} disabled={action !== ''}><Radar size={14} />{action === 'detect' ? 'Scanning...' : 'Scan endpoints'}</button>
                </header>
                <div className={integrationStyles.classes.endpoints}>{detail.endpoints.length > 0 ? detail.endpoints.map(renderEndpoint) : <p className={integrationStyles.classes.empty}>This service has no public HTTPS endpoint.</p>}</div>
                {detected.length > 0 ? (
                  <div className={integrationStyles.classes.endpoints}>
                    <h4 className={integrationStyles.classes.sectionTitle}>Detected on {detectedRoot}</h4>
                    {detected.map(renderDetected)}
                  </div>
                ) : null}
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
