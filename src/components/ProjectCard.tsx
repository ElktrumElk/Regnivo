import type { Project } from '../types/api.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import { formatRelativeTime } from '../utils/format.ts'

interface ProjectCardProps { project: Project }

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className={formStyles.classes.projectCard}>
      <div className={formStyles.classes.projectTop}>
        <h2 className={formStyles.classes.projectName}>{project.name}</h2>
        <span className={dashboardStyles.classes.status}><span className={dashboardStyles.classes.statusDot} />{project.status || 'healthy'}</span>
      </div>
      <p className={formStyles.classes.projectDescription}>{project.description || 'No project description.'}</p>
      <div className={formStyles.classes.projectMeta}><span>{project.monitorCount} monitors</span><span>Updated {formatRelativeTime(project.updatedAt)}</span></div>
    </article>
  )
}
