import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import { Topbar } from '../components/Topbar.tsx'
import { shellStyles } from '../styles/shellStyles.ts'

export function AppShell() {
  return (
    <div className={shellStyles.classes.shell}>
      <Sidebar />
      <div className={shellStyles.classes.content}>
        <Topbar />
        <main className={shellStyles.classes.main}><Outlet /></main>
      </div>
    </div>
  )
}
