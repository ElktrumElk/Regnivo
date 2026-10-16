import { Pause, Play, RotateCw } from 'lucide-react'
import type { Monitor } from '../types/api.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { tableStyles } from '../styles/tableStyles.ts'
import { formatRelativeTime } from '../utils/format.ts'

interface MonitorRowProps { monitor: Monitor; onTest: (monitor: Monitor) => void; onToggle: (monitor: Monitor) => void }

export function MonitorRow({ monitor, onTest, onToggle }: MonitorRowProps) {
  function handleTest() { onTest(monitor) }
  function handleToggle() { onToggle(monitor) }

  const toggleLabel = monitor.enabled ? 'Pause' : 'Resume'
  const ToggleIcon = monitor.enabled ? Pause : Play

  return (
    <tr>
      <td className={tableStyles.classes.cell}>
        <div className={tableStyles.classes.endpoint}>
          <strong className={tableStyles.classes.strong}>{monitor.name}</strong>
          <span className={tableStyles.classes.url}>{monitor.url}</span>
        </div>
      </td>
      <td className={tableStyles.classes.cell}>
        <span className={dashboardStyles.classes.status}><span className={dashboardStyles.classes.statusDot} />{monitor.status}</span>
      </td>
      <td className={tableStyles.classes.cell}>{monitor.method}</td>
      <td className={tableStyles.classes.cell}>{Math.round(monitor.intervalSeconds / 60)} min</td>
      <td className={tableStyles.classes.cell}>{monitor.lastRunAt ? formatRelativeTime(monitor.lastRunAt) : 'Not yet'}</td>
      <td className={tableStyles.classes.cell}>
        <div className={tableStyles.classes.rowActions}>
          <button className={tableStyles.classes.actionButton} type="button" onClick={handleTest}><RotateCw size={12} aria-hidden="true" />Test</button>
          <button className={tableStyles.classes.actionButton} type="button" onClick={handleToggle}><ToggleIcon size={12} aria-hidden="true" />{toggleLabel}</button>
        </div>
      </td>
    </tr>
  )
}
