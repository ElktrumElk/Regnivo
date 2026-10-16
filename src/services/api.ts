import type { ApiEnvelope, ApiFailure, AuthInput, CheckResult, Dashboard, MetricRange, Monitor, MonitorInput, Project, ProjectDetail, ProjectMetrics, RenderDeploy, RenderDeployMode, RenderIntegrationStatus, RenderService, RenderServiceDetail, Settings, User } from '../types/api.ts'

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
export function getRenderIntegration() { return request<RenderIntegrationStatus>('/integrations/render') }
export function getRenderServices() { return request<RenderService[]>('/integrations/render/services') }
export function getRenderService(serviceId: string) { return request<RenderServiceDetail>(`/integrations/render/services/${serviceId}`) }
export function getRenderDeploy(serviceId: string, deployId: string) { return request<RenderDeploy>(`/integrations/render/services/${serviceId}/deploys/${deployId}`) }
export function triggerRenderDeploy(serviceId: string, mode: RenderDeployMode, clearCache = false) {
  return request<RenderDeploy>(`/integrations/render/services/${serviceId}/deploys`, { method: 'POST', body: JSON.stringify({ mode, clearCache }) })
}
export function restartRenderService(serviceId: string) {
  return request<{ accepted: boolean }>(`/integrations/render/services/${serviceId}/restart`, { method: 'POST', body: JSON.stringify({}) })
}
export function getCurrentUser() { return request<User>('/me') }
export function login(input: AuthInput) { return request<User>('/auth/login', { method: 'POST', body: JSON.stringify(input) }) }
export function register(input: AuthInput) { return request<User>('/auth/register', { method: 'POST', body: JSON.stringify(input) }) }
export function logout() { return requestWithoutContent('/auth/logout', { method: 'POST' }) }
