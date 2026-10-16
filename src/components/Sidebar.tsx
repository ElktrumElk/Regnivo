import { Activity, FolderKanban, Gauge, PlusCircle, RadioTower, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { shellStyles } from '../styles/shellStyles.ts'

interface NavigationItem { label: string; path: string; icon: LucideIcon; end?: boolean }

const navigation: NavigationItem[] = [
  { label: 'Overview', path: '/app', icon: Gauge, end: true },
  { label: 'Projects', path: '/app/projects', icon: FolderKanban },
  { label: 'Add monitor', path: '/app/monitors/new', icon: PlusCircle },
  { label: 'Activity', path: '/app/activity', icon: Activity },
  { label: 'Settings', path: '/app/settings', icon: Settings },
]

function renderNavigationItem(item: NavigationItem) {
  const ItemIcon = item.icon
  return (
    <NavLink key={item.path} to={item.path} end={item.end} className={shellStyles.classes.navItem}>
      <ItemIcon size={16} aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className={shellStyles.classes.sidebar}>
      <div className={shellStyles.classes.brand}>
        <div className={shellStyles.classes.brandMark}><RadioTower size={16} aria-hidden="true" /></div>
        <span>ServerPulse</span>
      </div>
      <nav className={shellStyles.classes.nav} aria-label="Primary navigation">
        <p className={shellStyles.classes.navLabel}>Workspace</p>
        {navigation.map(renderNavigationItem)}
      </nav>
      <div className={shellStyles.classes.sidebarFooter}>
        <section className={shellStyles.classes.planCard} aria-label="Plan usage">
          <h2 className={shellStyles.classes.planTitle}>Developer plan</h2>
          <p className={shellStyles.classes.planText}>2 of 5 monitors active</p>
          <div className={shellStyles.classes.usageTrack}><div className={shellStyles.classes.usageBar} /></div>
        </section>
        <div className={shellStyles.classes.user}>
          <div className={shellStyles.classes.avatar}>DU</div>
          <div><p className={shellStyles.classes.userName}>Demo User</p><p className={shellStyles.classes.userEmail}>demo@regnivo.local</p></div>
        </div>
      </div>
    </aside>
  )
}
