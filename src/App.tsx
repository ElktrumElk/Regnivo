import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell.tsx'
import { ActivityPage } from './pages/ActivityPage.tsx'
import { AddMonitorPage } from './pages/AddMonitorPage.tsx'
import { EditMonitorPage } from './pages/EditMonitorPage.tsx'
import { OverviewPage } from './pages/OverviewPage.tsx'
import { ProjectOverviewPage } from './pages/ProjectOverviewPage.tsx'
import { ProjectLogPage } from './pages/ProjectLogPage.tsx'
import { ProjectSettingsPage } from './pages/ProjectSettingsPage.tsx'
import { ProjectsPage } from './pages/ProjectsPage.tsx'
import { SettingsPage } from './pages/SettingsPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { RenderIntegrationPage } from './pages/RenderIntegrationPage.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { AuthProvider } from './services/AuthContext.tsx'

// App owns routing while every product screen remains an isolated module.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<OverviewPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectOverviewPage />} />
              <Route path="projects/:projectId/logs" element={<ProjectLogPage />} />
              <Route path="projects/:projectId/settings" element={<ProjectSettingsPage />} />
              <Route path="projects/:projectId/monitors/new" element={<AddMonitorPage />} />
              <Route path="projects/:projectId/monitors/:monitorId/edit" element={<EditMonitorPage />} />
              <Route path="monitors/new" element={<AddMonitorPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="integrations/render" element={<RenderIntegrationPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
