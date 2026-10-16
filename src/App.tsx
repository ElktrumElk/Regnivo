import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell.tsx'
import { ActivityPage } from './pages/ActivityPage.tsx'
import { AddMonitorPage } from './pages/AddMonitorPage.tsx'
import { OverviewPage } from './pages/OverviewPage.tsx'
import { ProjectsPage } from './pages/ProjectsPage.tsx'
import { SettingsPage } from './pages/SettingsPage.tsx'

// App owns routing while every product screen remains an isolated module.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="monitors/new" element={<AddMonitorPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
