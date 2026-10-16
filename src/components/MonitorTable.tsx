import type { Monitor } from '../types/api.ts'
import { MonitorRow } from './MonitorRow.tsx'
import { tableStyles } from '../styles/tableStyles.ts'

interface MonitorTableProps { monitors: Monitor[]; onTest: (monitor: Monitor) => void; onToggle: (monitor: Monitor) => void }

export function MonitorTable({ monitors, onTest, onToggle }: MonitorTableProps) {
  function renderMonitor(monitor: Monitor) {
    return <MonitorRow key={monitor.id} monitor={monitor} onTest={onTest} onToggle={onToggle} />
  }

  if (monitors.length === 0) {
    return <p className={tableStyles.classes.emptyRow}>No monitors yet. Add an endpoint to get started.</p>
  }

  return (
    <div className={tableStyles.classes.scroll}>
      <table className={tableStyles.classes.table}>
        <thead>
          <tr>
            <th className={tableStyles.classes.heading}>Endpoint</th>
            <th className={tableStyles.classes.heading}>Status</th>
            <th className={tableStyles.classes.heading}>Method</th>
            <th className={tableStyles.classes.heading}>Interval</th>
            <th className={tableStyles.classes.heading}>Last check</th>
            <th className={tableStyles.classes.heading}>Actions</th>
          </tr>
        </thead>
        <tbody>{monitors.map(renderMonitor)}</tbody>
      </table>
    </div>
  )
}
