import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../services/AuthContext.tsx', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../services/AuthState.ts', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Test User', email: 'test@example.com' }, loading: false, logout: vi.fn() }),
}))

vi.mock('../services/api.ts', () => ({
  getIntegration: vi.fn().mockResolvedValue({ configured: false, provider: 'vercel' }),
  getIntegrationServices: vi.fn().mockResolvedValue([]),
  connectIntegration: vi.fn().mockResolvedValue({ configured: true, provider: 'vercel' }),
  disconnectIntegration: vi.fn(),
  getIntegrationService: vi.fn(),
  ignoreRequest: vi.fn(),
  triggerIntegrationDeploy: vi.fn(),
  restartIntegrationService: vi.fn(),
  detectIntegrationEndpoints: vi.fn(),
  getProject: vi.fn().mockResolvedValue(null),
  getDashboard: vi.fn().mockResolvedValue(null),
  getProjects: vi.fn().mockResolvedValue([]),
  getActivity: vi.fn().mockResolvedValue([]),
  getSettings: vi.fn().mockResolvedValue(null),
}))

import App from '../App.tsx'

describe('services routing', () => {
  it('opens the provider integration page instead of redirecting home', async () => {
    window.history.pushState({}, '', '/app/services/vercel')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Vercel' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/app/services/vercel')
  })
})
