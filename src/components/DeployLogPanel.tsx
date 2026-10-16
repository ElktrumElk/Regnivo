import { X } from 'lucide-react'
import type { DeployLogEntry, LogLevel } from '../types/log.ts'
import { logStyles } from '../styles/logStyles.ts'

interface DeployLogPanelProps { entries: DeployLogEntry[]; visible: boolean; onClose: () => void }

function levelClass(level: LogLevel): string {
  switch (level) {
    case 'request': return logStyles.classes.entry_request
    case 'success': return logStyles.classes.entry_success
    case 'error': return logStyles.classes.entry_error
    default: return logStyles.classes.entry_info
  }
}

function renderEntry(entry: DeployLogEntry) {
  return (
    <li key={entry.id} className={`${logStyles.classes.entry} ${levelClass(entry.level)}`}>
      <span className={logStyles.classes.time}>{entry.time}</span>
      <span className={logStyles.classes.message}>{entry.message}</span>
    </li>
  )
}

export function DeployLogPanel({ entries, visible, onClose }: DeployLogPanelProps) {
  if (!visible) return null
  return (
    <section className={logStyles.classes.panel} aria-label="Deployment log" aria-live="polite">
      <header className={logStyles.classes.header}>
        <div>
          <h2 className={logStyles.classes.title}>Deployment log</h2>
          <p className={logStyles.classes.subtitle}>Live trace of the deploy and first check</p>
        </div>
        <button className={logStyles.classes.close} type="button" onClick={onClose} aria-label="Close log"><X size={14} /></button>
      </header>
      <ul className={logStyles.classes.list}>{entries.map(renderEntry)}</ul>
    </section>
  )
}
