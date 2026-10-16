import type { ApiEnvelope, ApiFailure, CheckResult, Dashboard, MonitorInput, Project, Settings } from '../types/api.ts'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const failure = await response.json() as ApiFailure
    throw new Error(failure.error?.message ?? 'The ServerPulse API is unavailable.')
  }

  const payload = await response.json() as ApiEnvelope<T>
  return payload.data
}

// Named service functions keep transport details out of React modules.
export function getDashboard() { return request<Dashboard>('/dashboard') }
export function getProjects() { return request<Project[]>('/projects') }
export function getActivity() { return request<CheckResult[]>('/activity?pageSize=50') }
export function getSettings() { return request<Settings>('/settings') }
export function createProject(name: string, description: string) {
  return request<Project>('/projects', { method: 'POST', body: JSON.stringify({ name, description }) })
}
export function createMonitor(projectId: string, input: MonitorInput) {
  return request(`/projects/${projectId}/monitors`, { method: 'POST', body: JSON.stringify(input) })
}
export function updateSettings(settings: Partial<Settings>) {
  return request<Settings>('/settings', { method: 'PATCH', body: JSON.stringify(settings) })
}
