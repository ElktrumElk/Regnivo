export type MonitorStatus = 'healthy' | 'failing' | 'paused' | 'pending' | 'unknown'

export interface Summary {
  checks: number
  successful: number
  failed: number
  successRate: number
  averageResponseMs: number
  medianResponseMs: number
  p95ResponseMs: number
  bytesReceived: number
}

export interface CheckResult {
  id: string
  projectId: string
  monitorId: string
  monitorName?: string
  trigger: 'scheduled' | 'manual'
  method: string
  url: string
  startedAt: string
  completedAt: string
  statusCode?: number
  outcome: string
  durationMs: number
  bytesReceived: number
  message?: string
}

export interface Dashboard {
  projectCount: number
  activeMonitors: number
  summary: Summary
  recentActivity: CheckResult[]
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  monitorCount: number
  status: MonitorStatus
}

export interface MonitorInput {
  name: string
  url: string
  method: 'GET' | 'HEAD'
  intervalSeconds: number
  timeoutMs: number
  expectedStatus: number[]
  enabled: boolean
}

export interface Settings {
  name: string
  email: string
  timezone: string
  defaultIntervalSeconds: number
  pauseAll: boolean
  retentionDays: number
}

export interface ApiEnvelope<T> { data: T }
export interface ApiFailure { error: { message: string } }
