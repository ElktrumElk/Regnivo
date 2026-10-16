import { dashboardStyles } from '../styles/dashboardStyles.ts'

export function LoadingPanel() {
  return <div className={dashboardStyles.classes.empty} role="status">Connecting to monitoring service...</div>
}
