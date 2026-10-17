import { Activity, ArrowLeft, BookOpen, Cloud, FolderKanban, Gauge, LogOut, PlusCircle, RadioTower, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useMatch, useNavigate } from 'react-router-dom'
import { shellStyles } from '../styles/shellStyles.ts'
import { useAuth } from '../services/AuthState.ts'

interface NavigationItem { label: string; path: string; icon: LucideIcon; end?: boolean }

const workspaceNavigation: NavigationItem[] = [
  { label: 'Overview', path: '/app', icon: Gauge, end: true },
  { label: 'Projects', path: '/app/projects', icon: FolderKanban },
  { label: 'Add monitor', path: '/app/monitors/new', icon: PlusCircle },
  { label: 'Activity', path: '/app/activity', icon: Activity },
  { label: 'Services', path: '/app/services', icon: Cloud },
  { label: 'Settings', path: '/app/settings', icon: Settings },
]

function buildProjectNavigation(projectId: string): NavigationItem[] {
  return [
    { label: 'Project overview', path: `/app/projects/${projectId}`, icon: Gauge, end: true },
    { label: 'Request log', path: `/app/projects/${projectId}/logs`, icon: Activity },
    { label: 'Settings', path: `/app/projects/${projectId}/settings`, icon: Settings },
  ]
}

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const projectMatch = useMatch({ path: '/app/projects/:projectId', end: false })
  const projectId = projectMatch?.params.projectId
  const initials = user?.name.split(' ').map(firstLetter).join('').slice(0, 2).toUpperCase() ?? 'SP'
  const projectNav = projectId ? buildProjectNavigation(projectId) : []

  async function handleLogout() { await logout(); navigate('/login', { replace: true }) }
  return (
    <aside className={shellStyles.classes.sidebar}>
      <div className={shellStyles.classes.brand}>
        <div className={shellStyles.classes.brandMark}><RadioTower size={16} aria-hidden="true" /></div>
        <span>Regnivo</span>
      </div>
      <nav className={shellStyles.classes.nav} aria-label="Primary navigation">
        {projectId ? (
          <>
            <p className={shellStyles.classes.navLabel}>Project</p>
            {projectNav.map(renderNavigationItem)}
            <NavLink to="/app/projects" className={shellStyles.classes.navItem}><ArrowLeft size={16} aria-hidden="true" /><span>All projects</span></NavLink>
          </>
        ) : null}
        {projectId ? null : (
          <>
            <p className={shellStyles.classes.navLabel}>Workspace</p>
            {workspaceNavigation.map(renderNavigationItem)}
          </>
        )}
      </nav>
      <div className={shellStyles.classes.sidebarFooter}>
        <NavLink to="/app/guide" className={shellStyles.classes.guideLink}>
          <BookOpen size={16} aria-hidden="true" />
          <span>User guide</span>
        </NavLink>
        <div className={shellStyles.classes.user}>
          <div className={shellStyles.classes.avatar}>{initials}</div>
          <div className={shellStyles.classes.userDetails}><p className={shellStyles.classes.userName}>{user?.name}</p><p className={shellStyles.classes.userEmail}>{user?.email}</p></div>
          <button className={shellStyles.classes.logoutButton} type="button" onClick={handleLogout} aria-label="Log out"><LogOut size={14} /></button>
        </div>
      </div>
    </aside>
  )
}

function firstLetter(value: string) { return value.charAt(0) }
