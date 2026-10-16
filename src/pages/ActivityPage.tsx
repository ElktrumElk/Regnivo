import { ActivityTable } from '../components/ActivityTable.tsx'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { LoadingPanel } from '../components/LoadingPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { getActivity } from '../services/api.ts'
import { useResource } from '../services/useResource.ts'
import { dashboardStyles } from '../styles/dashboardStyles.ts'

export function ActivityPage() {
  const { data, error, loading } = useResource(getActivity)
  if (loading) return <LoadingPanel />
  if (error || !data) return <ErrorPanel message={error} />

  return (
    <>
      <PageHeader eyebrow="Request log" title="Activity" description="Inspect every scheduled and manual check. Timestamps are shown in UTC and sensitive query values are never included." />
      <section className={dashboardStyles.classes.section}><header className={dashboardStyles.classes.sectionHeader}><div><h2 className={dashboardStyles.classes.panelTitle}>All checks</h2><p className={dashboardStyles.classes.panelMeta}>{data.length} retained events · 30-day retention</p></div></header><ActivityTable activity={data} /></section>
    </>
  )
}
