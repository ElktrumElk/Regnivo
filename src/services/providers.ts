import { Cloud, Triangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { IntegrationProvider } from '../types/api.ts'

export interface ProviderConfig {
  id: IntegrationProvider
  name: string
  description: string
  path: string
  icon: LucideIcon
  credentialLabel: string
  credentialHint: string
  scopeLabel: string
  scopeHint: string
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'render',
    name: 'Render',
    description: 'Connect your own Render account to inspect services, trigger deployments, restart live services, and create endpoint monitors.',
    path: '/app/services/render',
    icon: Cloud,
    credentialLabel: 'Render API key',
    credentialHint: 'Create one in Render under Account Settings → API Keys.',
    scopeLabel: 'Workspace ID (optional)',
    scopeHint: 'Limits results to a single Render workspace. Leave blank to use every workspace the key can access.',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Connect your own Vercel account to inspect projects, redeploy builds, restart deployments, and create endpoint monitors.',
    path: '/app/services/vercel',
    icon: Triangle,
    credentialLabel: 'Vercel access token',
    credentialHint: 'Create one in Vercel under Account Settings → Tokens.',
    scopeLabel: 'Team ID (optional)',
    scopeHint: 'Limits results to a single Vercel team. Leave blank to use your personal account.',
  },
]

export function providerById(id: string | undefined): ProviderConfig | undefined {
  return PROVIDERS.find(provider => provider.id === id)
}
