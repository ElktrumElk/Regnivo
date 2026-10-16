import { dashboardStyles } from '../styles/dashboardStyles.ts'

interface ErrorPanelProps { message: string }

export function ErrorPanel({ message }: ErrorPanelProps) {
  return <div className={dashboardStyles.classes.error} role="alert">{message} Check the backend API is running, then retry.</div>
}
