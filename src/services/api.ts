import type { ApiEnvelope, ApiFailure, AuthInput, CheckResult, Dashboard, Deploy, DeployMode, DetectEndpointsResult, IntegrationProvider, IntegrationStatus, MetricRange, Monitor, MonitorInput, Project, ProjectDetail, ProjectMetrics, Service, ServiceDetail, Settings, User } from '../types/api.ts'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const failure = await response.json() as ApiFailure
    throw new Error(failure.error?.message ?? 'The Regnivo API is unavailable.')
  }

  const payload = await response.json() as ApiEnvelope<T>
  return payload.data
}

async function requestWithoutContent(path: string, init: RequestInit, failure = 'Request failed.'): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json' } })
  if (!response.ok) throw new Error(failure)
}

// Integration responses are cached in-memory so navigating between the service
// page and the monitor form reuses data instead of refetching. Callers that
// need live data (deploy polling) pass fresh = true.
const integrationCache = new Map<string, unknown>()
const integrationInflight = new Map<string, Promise<unknown>>()

function cachedRequest<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (integrationCache.has(key)) return Promise.resolve(integrationCache.get(key) as T)
  const pending = integrationInflight.get(key)
  if (pending) return pending as Promise<T>
  const promise = loader()
    .then(value => { integrationCache.set(key, value); return value })
    .finally(() => { integrationInflight.delete(key) })
  integrationInflight.set(key, promise)
  return promise
}

export function invalidateIntegration(provider?: IntegrationProvider) {
  for (const key of [...integrationCache.keys()]) {
    if (!provider || key.includes(`:${provider}`)) integrationCache.delete(key)
  }
}

export function peekIntegrationServices(provider: IntegrationProvider): Service[] | undefined {
  return integrationCache.get(`services:${provider}`) as Service[] | undefined
}

export function peekIntegrationService(provider: IntegrationProvider, serviceId: string): ServiceDetail | undefined {
  return integrationCache.get(`service:${provider}:${serviceId}`) as ServiceDetail | undefined
}

// Named service functions keep transport details out of React modules.
export function getDashboard() { return request<Dashboard>('/dashboard') }
export function getProjects() { return request<Project[]>('/projects') }
export function getProject(projectId: string) { return request<ProjectDetail>(`/projects/${projectId}`) }
export function getProjectMetrics(projectId: string, range: MetricRange) {
  return request<ProjectMetrics>(`/projects/${projectId}/metrics?range=${range}`)
}
export function getProjectResults(projectId: string) {
  return request<CheckResult[]>(`/projects/${projectId}/results?pageSize=200`)
}
export function clearProjectResults(projectId: string) {
  return request<{ deleted: number }>(`/projects/${projectId}/results`, { method: 'DELETE' })
}
export function clearMonitorResults(monitorId: string) {
  return request<{ deleted: number }>(`/monitors/${monitorId}/results`, { method: 'DELETE' })
}
export function clearActivity() {
  return request<{ deleted: number }>('/activity', { method: 'DELETE' })
}
export function deleteResult(resultId: string) {
  return requestWithoutContent(`/results/${resultId}`, { method: 'DELETE' }, 'Unable to delete log entry.')
}
export function updateProject(projectId: string, input: { name?: string; description?: string }) {
  return request<Project>(`/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(input) })
}
export function deleteProject(projectId: string) {
  return requestWithoutContent(`/projects/${projectId}`, { method: 'DELETE' }, 'Unable to delete project.')
}
export function getActivity() { return request<CheckResult[]>('/activity?pageSize=50') }
export function getSettings() { return request<Settings>('/settings') }
export function createProject(name: string, description: string) {
  return request<Project>('/projects', { method: 'POST', body: JSON.stringify({ name, description }) })
}
export function createMonitor(projectId: string, input: MonitorInput) {
  return request<Monitor>(`/projects/${projectId}/monitors`, { method: 'POST', body: JSON.stringify(input) })
}
export function getMonitor(monitorId: string) {
  return request<Monitor>(`/monitors/${monitorId}`)
}
export function updateMonitor(monitorId: string, input: Partial<MonitorInput>) {
  return request<Monitor>(`/monitors/${monitorId}`, { method: 'PATCH', body: JSON.stringify(input) })
}
export function deleteMonitor(monitorId: string) {
  return requestWithoutContent(`/monitors/${monitorId}`, { method: 'DELETE' }, 'Unable to remove monitor.')
}
export function testMonitor(monitorId: string) {
  return request<CheckResult>(`/monitors/${monitorId}/test`, { method: 'POST' })
}
export function pauseMonitor(monitorId: string) {
  return request<Monitor>(`/monitors/${monitorId}/pause`, { method: 'POST' })
}
export function resumeMonitor(monitorId: string) {
  return request<Monitor>(`/monitors/${monitorId}/resume`, { method: 'POST' })
}
export function updateSettings(settings: Partial<Settings>) {
  return request<Settings>('/settings', { method: 'PATCH', body: JSON.stringify(settings) })
}
export function getIntegration(provider: IntegrationProvider) {
  return cachedRequest(`status:${provider}`, () => request<IntegrationStatus>(`/integrations/${provider}`))
}
export function connectIntegration(provider: IntegrationProvider, input: { credential: string; scopeId: string }) {
  return request<IntegrationStatus>(`/integrations/${provider}`, { method: 'PUT', body: JSON.stringify(input) }).then(status => { invalidateIntegration(provider); return status })
}
export function disconnectIntegration(provider: IntegrationProvider) {
  return request<IntegrationStatus>(`/integrations/${provider}`, { method: 'DELETE' }).then(status => { invalidateIntegration(provider); return status })
}
export function getIntegrationServices(provider: IntegrationProvider) {
  return cachedRequest(`services:${provider}`, () => request<Service[]>(`/integrations/${provider}/services`))
}
export function getIntegrationService(provider: IntegrationProvider, serviceId: string, fresh = false) {
  const key = `service:${provider}:${serviceId}`
  if (fresh) integrationCache.delete(key)
  return cachedRequest(key, () => request<ServiceDetail>(`/integrations/${provider}/services/${serviceId}`))
}
export function getIntegrationDeploy(provider: IntegrationProvider, serviceId: string, deployId: string) { return request<Deploy>(`/integrations/${provider}/services/${serviceId}/deploys/${deployId}`) }
export function triggerIntegrationDeploy(provider: IntegrationProvider, serviceId: string, mode: DeployMode, clearCache = false) {
  return request<Deploy>(`/integrations/${provider}/services/${serviceId}/deploys`, { method: 'POST', body: JSON.stringify({ mode, clearCache }) }).then(deploy => { invalidateIntegration(provider); return deploy })
}
export function restartIntegrationService(provider: IntegrationProvider, serviceId: string) {
  return request<{ accepted: boolean }>(`/integrations/${provider}/services/${serviceId}/restart`, { method: 'POST', body: JSON.stringify({}) }).then(result => { invalidateIntegration(provider); return result })
}
export function detectIntegrationEndpoints(provider: IntegrationProvider, serviceId: string) {
  return request<DetectEndpointsResult>(`/integrations/${provider}/services/${serviceId}/detect-endpoints`, { method: 'POST', body: JSON.stringify({}) })
}
export function getCurrentUser() { return request<User>('/me') }
export function login(input: AuthInput) { return request<User>('/auth/login', { method: 'POST', body: JSON.stringify(input) }) }
export function register(input: AuthInput) { return request<User>('/auth/register', { method: 'POST', body: JSON.stringify(input) }) }
export function logout() { return requestWithoutContent('/auth/logout', { method: 'POST' }) }
