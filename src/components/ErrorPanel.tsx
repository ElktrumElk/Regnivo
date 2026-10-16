import { dashboardStyles } from '../styles/dashboardStyles.ts'

interface ErrorPanelProps { message: string }

export function ErrorPanel({ message }: ErrorPanelProps) {
  return <div className={dashboardStyles.classes.error} role="alert">{message} Start the Go API on port 8080, then retry.</div>
}
