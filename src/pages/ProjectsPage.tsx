import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { ProjectCard } from '../components/ProjectCard.tsx'
import { createProject, getProjects } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'
import { formStyles } from '../styles/formStyles.ts'
import type { Project } from '../types/api.ts'

function renderProject(project: Project) { return <ProjectCard key={project.id} project={project} /> }

export function ProjectsPage() {
  const { data, error, loading, setData } = useResource(getProjects)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  function openForm() { setShowForm(true) }
  function closeForm() { setShowForm(false) }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    try {
      const project = await createProject(String(values.get('name')), String(values.get('description')))
      setData([project, ...(data ?? [])])
      setShowForm(false)
      setMessage('Project created successfully.')
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to create project.') }
  }

  if (loading) return <LoadingPanel />
  if (error || !data) return <ErrorPanel message={error} />

  const actions = <button className={dashboardStyles.classes.primaryButton} type="button" onClick={openForm}><Plus size={14} />New project</button>
  return (
    <>
      <PageHeader eyebrow="Project directory" title="Projects" description="Group related endpoints, compare their health, and keep production and development traffic separate." actions={actions} />
      {message ? <p className={formStyles.classes.message} role="status">{message}</p> : null}
      {showForm ? <section className={formStyles.classes.card}><form className={formStyles.classes.form} onSubmit={handleSubmit}><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="project-name">Project name</label><input className={formStyles.classes.input} id="project-name" name="name" required maxLength={100} /></div><div className={formStyles.classes.field}><label className={formStyles.classes.label} htmlFor="project-description">Description</label><textarea className={formStyles.classes.textarea} id="project-description" name="description" maxLength={500} /></div><div className={formStyles.classes.actions}><button className={dashboardStyles.classes.primaryButton} type="submit">Create project</button><button className={dashboardStyles.classes.secondaryButton} type="button" onClick={closeForm}>Cancel</button></div></form></section> : <section className={formStyles.classes.projects}>{data.map(renderProject)}</section>}
    </>
  )
}
