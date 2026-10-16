export type LogLevel = 'info' | 'request' | 'success' | 'error'

export interface DeployLogEntry {
  id: number
  time: string
  level: LogLevel
  message: string
}
