import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { HeaderEditor } from '../components/HeaderEditor.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { createMonitor, getIntegrationService, getIntegrationServices, getProjects, peekIntegrationService, peekIntegrationServices } from '../services/api.ts'
import { PROVIDERS, providerById } from '../services/providers.ts'
import type { ProviderConfig } from '../services/providers.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import type { IntegrationProvider, Project, Service, ServiceEndpoint } from '../types/api.ts'
import { headerRowsToRecord } from '../utils/headers.ts'
import type { HeaderRow } from '../utils/headers.ts'

const METHOD_OPTIONS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

const INTERVAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 60, label: 'Every minute' },
  { value: 300, label: 'Every 5 minutes' },
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

interface ServiceOption { provider: IntegrationProvider; service: Service }

function renderServiceOption(option: ServiceOption) {
  const providerName = providerById(option.provider)?.name ?? option.provider
  return <option key={`${option.provider}:${option.service.id}`} value={`${option.provider}:${option.service.id}`}>{option.service.name} · {option.service.type.replaceAll('_', ' ')} · {providerName}</option>
}

function renderEndpointOption(endpoint: ServiceEndpoint) {
  return <option key={`${endpoint.kind}-${endpoint.url}`} value={endpoint.url}>{endpoint.label} · {endpoint.url}</option>
}

async function loadProviderServices(provider: ProviderConfig): Promise<ServiceOption[]> {
  try {
    const services = await getIntegrationServices(provider.id)
    return services.filter(service => Boolean(service.serviceDetails.url)).map(service => ({ provider: provider.id, service }))
  } catch {
    return []
  }
}

function cachedServiceOptions(): ServiceOption[] {
  return PROVIDERS.flatMap(provider => {
    const services = peekIntegrationServices(provider.id) ?? []
    return services.filter(service => Boolean(service.serviceDetails.url)).map(service => ({ provider: provider.id, service }))
  })
}

export function AddMonitorPage() {
  const params = useParams()
  const scopedProjectId = params.projectId
  const [searchParams] = useSearchParams()
  const initialProvider = (searchParams.get('provider') as IntegrationProvider | null) ?? (searchParams.get('renderServiceId') ? 'render' : '')
  const initialServiceId = searchParams.get('serviceId') ?? searchParams.get('renderServiceId') ?? ''
  const initialEndpoint = searchParams.get('endpoint') ?? ''
  const initialDetail = initialProvider && initialServiceId ? peekIntegrationService(initialProvider, initialServiceId) : undefined

  const { data: projects, error, loading } = useResource(getProjects)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>([])
  const [name, setName] = useState('')
  const [url, setURL] = useState(initialEndpoint)
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>(cachedServiceOptions)
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | ''>(initialProvider)
  const [serviceId, setServiceId] = useState(initialServiceId)
  const [serviceEndpoints, setServiceEndpoints] = useState<ServiceEndpoint[]>(initialDetail?.endpoints ?? [])
  const [selectedEndpoint, setSelectedEndpoint] = useState(initialEndpoint)
  const [servicesLoading, setServicesLoading] = useState(Boolean(initialServiceId) && !initialDetail)
  const [servicesMessage, setServicesMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    Promise.all(PROVIDERS.map(loadProviderServices)).then(results => {
      if (!active) return
      const available = results.flat()
      setServiceOptions(available)
      if (available.length === 0) setServicesMessage('No connected services found. Manual URL entry still works.')
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedProvider || !serviceId) return
    let active = true
    getIntegrationService(selectedProvider, serviceId)
      .then(detail => {
        if (!active) return
        setServiceEndpoints(detail.endpoints)
        const chosen = detail.endpoints.find(endpoint => endpoint.url === initialEndpoint) ?? detail.endpoints[0]
        if (chosen) {
          setSelectedEndpoint(chosen.url)
          setURL(chosen.url)
        }
        setName(current => current || detail.service.name)
      })
      .catch(cause => {
        if (active) setServicesMessage(cause instanceof Error ? cause.message : 'Unable to load this service.')
      })
      .finally(() => {
        if (active) setServicesLoading(false)
      })
    return () => { active = false }
  }, [selectedProvider, serviceId, initialEndpoint])

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) { setName(event.target.value) }
  function handleURLChange(event: ChangeEvent<HTMLInputElement>) { setURL(event.target.value) }

  function handleServiceChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    setServiceEndpoints([])
    setSelectedEndpoint('')
    setServicesMessage('')
    if (!value) {
      setSelectedProvider('')
      setServiceId('')
      return
    }
    const separator = value.indexOf(':')
    setSelectedProvider(value.slice(0, separator) as IntegrationProvider)
    setServiceId(value.slice(separator + 1))
    setServicesLoading(true)
  }

  function handleEndpointChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedEndpoint(event.target.value)
    setURL(event.target.value)
  }

  function goToProjects() { navigate('/app/projects') }
  function handleBackToProject() { if (scopedProjectId) navigate(`/app/projects/${scopedProjectId}`) }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const values = new FormData(event.currentTarget)
    const projectId = scopedProjectId ?? String(values.get('projectId'))
    const input = {
      name,
      url,
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
      const monitor = await createMonitor(projectId, input)
      const query = new URLSearchParams({ runMonitorId: monitor.id, monitorName: monitor.name })
      navigate(`/app/projects/${projectId}/logs?${query.toString()}`)
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to deploy monitor.')
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

  const scopedProjectName = scopedProjectId ? projects.find(project => project.id === scopedProjectId)?.name : undefined
  const description = scopedProjectId ? 'Register an endpoint in this project. The live request log opens and runs the first check after deployment.' : 'Register a public HTTPS endpoint manually or select one directly from a connected service.'
  const selectedProviderName = providerById(selectedProvider || undefined)?.name

  return (
    <>
      <PageHeader eyebrow="Monitor deployment" title="Add endpoint" description={description} />
      <section className={formStyles.classes.card}>
        <form className={formStyles.classes.form} onSubmit={handleSubmit}>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="service-source">Endpoint source</label>
            <select className={formStyles.classes.input} id="service-source" value={selectedProvider && serviceId ? `${selectedProvider}:${serviceId}` : ''} onChange={handleServiceChange}>
              <option value="">Manual HTTPS URL</option>
              {serviceOptions.map(renderServiceOption)}
            </select>
            {servicesMessage ? <p className={formStyles.classes.hint}>{servicesMessage}</p> : <p className={formStyles.classes.hint}>Select a connected service to load its public URL, health check, and verified custom domains.</p>}
            {serviceOptions.length === 0 ? <Link className={dashboardStyles.classes.textLink} to="/app/services">Connect a service</Link> : null}
          </div>

          {selectedProvider && serviceId ? (
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="service-endpoint">{selectedProviderName ?? 'Service'} API or endpoint</label>
              <select className={formStyles.classes.input} id="service-endpoint" value={selectedEndpoint} onChange={handleEndpointChange} disabled={servicesLoading}>
                {servicesLoading ? <option value="">Loading endpoints...</option> : null}
                {!servicesLoading && serviceEndpoints.length === 0 ? <option value="">No public endpoint returned</option> : null}
                {serviceEndpoints.map(renderEndpointOption)}
              </select>
            </div>
          ) : null}

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
              <input className={formStyles.classes.input} id="monitor-name" name="name" placeholder="API health" value={name} onChange={handleNameChange} required maxLength={100} />
            </div>
          </div>
          <div className={formStyles.classes.field}>
            <label className={formStyles.classes.label} htmlFor="monitor-url">Target URL</label>
            <input className={formStyles.classes.input} id="monitor-url" name="url" type="url" placeholder="https://api.example.com/health" pattern="https://.*" value={url} onChange={handleURLChange} required />
            <p className={formStyles.classes.hint}>You can append an API route to a selected service origin. Private, loopback, metadata, reserved, and credential-bearing destinations are blocked.</p>
          </div>
          <div className={formStyles.classes.row}>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-method">Request method</label>
              <select className={formStyles.classes.input} id="monitor-method" name="method" defaultValue="GET">{METHOD_OPTIONS.map(renderMethodOption)}</select>
            </div>
            <div className={formStyles.classes.field}>
              <label className={formStyles.classes.label} htmlFor="monitor-interval">Check interval</label>
              <select className={formStyles.classes.input} id="monitor-interval" name="intervalSeconds" defaultValue="300">{INTERVAL_OPTIONS.map(renderIntervalOption)}</select>
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
              <select className={formStyles.classes.input} id="monitor-retry-timeout" name="retryTimeoutMs" defaultValue="10000">{TIMEOUT_OPTIONS.map(renderTimeoutOption)}</select>
              <p className={formStyles.classes.hint}>Longer per-request timeout applied to each retry attempt.</p>
            </div>
          </div>
          <HeaderEditor rows={headerRows} onChange={setHeaderRows} />
          <label className={formStyles.classes.checkboxRow}><span><strong className={formStyles.classes.label}>Activate monitoring</strong><p className={formStyles.classes.hint}>Schedule server-side checks immediately after deployment.</p></span><input className={formStyles.classes.checkbox} type="checkbox" name="enabled" defaultChecked /></label>
          <div className={formStyles.classes.actions}>
            <button className={dashboardStyles.classes.primaryButton} type="submit" disabled={saving}>{saving ? 'Creating monitor...' : 'Deploy monitor'}</button>
            {message ? <p className={formStyles.classes.danger} role="alert">{message}</p> : null}
            {scopedProjectId ? <button className={dashboardStyles.classes.secondaryButton} type="button" onClick={handleBackToProject}>Back to project</button> : null}
          </div>
        </form>
      </section>
    </>
  )
}
