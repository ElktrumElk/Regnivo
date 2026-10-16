import { Fragment, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getProject } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { shellStyles } from '../styles/shellStyles.ts'

const SECTION_LABELS: Record<string, string> = {
  projects: 'Projects',
  monitors: 'Add monitor',
  activity: 'Activity',
  settings: 'Settings',
}

const SUB_LABELS: Record<string, string> = {
  logs: 'Request log',
  settings: 'Settings',
  monitors: 'Add monitor',
}

// Resolves the human-readable project name for the breadcrumb trail.
function useProjectName(projectId?: string): string {
  const loader = useCallback(
    () => (projectId ? getProject(projectId) : Promise.resolve(null)),
    [projectId],
  )
  const { data } = useResource(loader)
  return data?.project.name ?? projectId ?? ''
}

function buildCrumbs(segments: string[], projectName: string): string[] {
  const crumbs = ['Workspace']
  const section = segments[1]
  if (!section) return [...crumbs, 'Overview']
  crumbs.push(SECTION_LABELS[section] ?? 'Overview')
  if (section === 'projects' && segments[2]) crumbs.push(projectName || segments[2])
  const sub = SUB_LABELS[segments[3] ?? '']
  if (sub) crumbs.push(sub)
  return crumbs
}

export function Topbar() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const section = segments[1] ?? ''
  const projectId = section === 'projects' ? segments[2] : undefined
  const projectName = useProjectName(projectId)
  const crumbs = buildCrumbs(segments, projectName)

  function renderCrumb(crumb: string, index: number) {
    const isLast = index === crumbs.length - 1
    return (
      <Fragment key={`${crumb}-${index}`}>
        {index > 0 ? <span aria-hidden="true">/</span> : null}
        {isLast
          ? <strong className={shellStyles.classes.workspaceName}>{crumb}</strong>
          : <span className={shellStyles.classes.workspaceLabel}>{crumb}</span>}
      </Fragment>
    )
  }

  return (
    <header className={shellStyles.classes.topbar}>
      <div className={shellStyles.classes.workspace}>
        {crumbs.map(renderCrumb)}
      </div>
    </header>
  )
}
