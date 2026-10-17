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
  bytesSent?: number
  message?: string
  errorCode?: string
  error?: string
  requestHeaders?: Record<string, string>
  responseHeaders?: Record<string, string>
  requestBody?: string
  responseBody?: string
  timingMs?: Record<string, number>
  requestSize?: number
  responseSize?: number
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

export interface Monitor {
  id: string
  projectId: string
  name: string
  url: string
  method: string
  intervalSeconds: number
  timeoutMs: number
  expectedStatus: number[]
  enabled: boolean
  retryCount: number
  retryTimeoutMs: number
  headers: Record<string, string>
  lastRunAt?: string
  nextRunAt?: string
  createdAt: string
  updatedAt: string
  status: MonitorStatus
}

export interface ProjectDetail {
  project: Project
  monitors: Monitor[]
}

export interface MetricPoint {
  timestamp: string
  checks: number
  successful: number
  failed: number
  averageResponseMs: number
  p95ResponseMs: number
  bytes: number
}

export interface ProjectMetrics {
  projectId: string
  rangeStart: string
  summary: Summary
  series: MetricPoint[]
}

export type MetricRange = '24h' | '7d' | '30d'

export interface MonitorInput {
  name: string
  url: string
  method: string
  intervalSeconds: number
  timeoutMs: number
  expectedStatus: number[]
  enabled: boolean
  retryCount?: number
  retryTimeoutMs?: number
  headers?: Record<string, string>
}

export interface Settings {
  name: string
  email: string
  timezone: string
  defaultIntervalSeconds: number
  pauseAll: boolean
  retentionDays: number
}

export interface RenderIntegrationStatus {
  configured: boolean
  ownerId?: string
  accountName?: string
}

export interface RenderServiceDetails {
  runtime?: string
  region?: string
  plan?: string
  url?: string
  healthCheckPath?: string
}

export interface RenderService {
  id: string
  name: string
  ownerId: string
  type: string
  repo?: string
  branch?: string
  slug?: string
  dashboardUrl?: string
  suspended?: string
  autoDeployTrigger?: string
  createdAt?: string
  updatedAt?: string
  serviceDetails: RenderServiceDetails
}

export interface RenderCommit {
  id: string
  message?: string
  createdAt?: string
}

export interface RenderDeploy {
  id?: string
  status?: string
  trigger?: string
  commit?: RenderCommit
  image?: { ref?: string; sha?: string }
  createdAt?: string
  startedAt?: string
  updatedAt?: string
  finishedAt?: string
}

export interface RenderEndpoint {
  label: string
  url: string
  kind: 'render' | 'health_check' | 'custom_domain' | string
}

export interface RenderDomain {
  id: string
  name: string
  domainType?: string
  verificationStatus?: string
  redirectForName?: string
  createdAt?: string
}

export interface RenderServiceDetail {
  service: RenderService
  endpoints: RenderEndpoint[]
  domains: RenderDomain[]
  deploys: RenderDeploy[]
  latestDeploy?: RenderDeploy
}

export type RenderDeployMode = 'build_and_deploy' | 'deploy_only'

export interface ApiEnvelope<T> { data: T }
export interface ApiFailure { error: { message: string } }

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface AuthInput {
  name?: string
  email: string
  password: string
}
