import type { CheckResult } from '../types/api.ts'
import { tableStyles } from '../styles/tableStyles.ts'
import { formatBytes, formatRelativeTime } from '../utils/format.ts'

interface ActivityTableProps { activity: CheckResult[] }

function renderActivity(result: CheckResult) {
  return (
    <tr key={result.id}>
      <td className={tableStyles.classes.cell}><div className={tableStyles.classes.endpoint}><strong className={tableStyles.classes.strong}>{result.monitorName ?? 'Endpoint check'}</strong><span className={tableStyles.classes.url}>{result.url}</span></div></td>
      <td className={tableStyles.classes.cell}><span className={tableStyles.classes.code}>{result.statusCode || 'ERR'}</span></td>
      <td className={tableStyles.classes.cell}>{result.durationMs} ms</td>
      <td className={tableStyles.classes.cell}>{formatBytes(result.bytesReceived)}</td>
      <td className={`${tableStyles.classes.cell} ${tableStyles.classes.source}`}>{result.trigger}</td>
      <td className={tableStyles.classes.cell}>{formatRelativeTime(result.startedAt)}</td>
    </tr>
  )
}

export function ActivityTable({ activity }: ActivityTableProps) {
  return (
    <div className={tableStyles.classes.scroll}>
      <table className={tableStyles.classes.table}>
        <thead><tr><th className={tableStyles.classes.heading}>Endpoint</th><th className={tableStyles.classes.heading}>Status</th><th className={tableStyles.classes.heading}>Latency</th><th className={tableStyles.classes.heading}>Transfer</th><th className={tableStyles.classes.heading}>Source</th><th className={tableStyles.classes.heading}>Checked</th></tr></thead>
        <tbody>{activity.map(renderActivity)}</tbody>
      </table>
    </div>
  )
}
