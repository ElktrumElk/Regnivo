import type { ReactNode } from 'react'
import { dashboardStyles } from '../styles/dashboardStyles.ts'

interface PageHeaderProps { eyebrow: string; title: string; description: string; actions?: ReactNode }

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className={dashboardStyles.classes.header}>
      <div><p className={dashboardStyles.classes.eyebrow}>{eyebrow}</p><h1 className={dashboardStyles.classes.title}>{title}</h1><p className={dashboardStyles.classes.subtitle}>{description}</p></div>
      {actions ? <div className={dashboardStyles.classes.headerActions}>{actions}</div> : null}
    </header>
  )
}
