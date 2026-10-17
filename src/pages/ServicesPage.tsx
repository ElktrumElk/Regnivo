import { Cloud } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader.tsx'
import { integrationStyles } from '../styles/integrationStyles.ts'

interface ServiceProvider {
  id: string
  name: string
  description: string
  path: string
  icon: LucideIcon
}

const providers: ServiceProvider[] = [
  {
    id: 'render',
    name: 'Render',
    description: 'Connect your own Render account to inspect services, trigger deployments, restart live services, and create endpoint monitors.',
    path: '/app/services/render',
    icon: Cloud,
  },
]

function renderProvider(provider: ServiceProvider) {
  const ProviderIcon = provider.icon
  return (
    <Link key={provider.id} className={integrationStyles.classes.providerCard} to={provider.path}>
      <div className={integrationStyles.classes.providerTop}>
        <span className={integrationStyles.classes.providerIcon}><ProviderIcon size={17} aria-hidden="true" /></span>
        <span className={integrationStyles.classes.providerBadge}>Connect</span>
      </div>
      <h2 className={integrationStyles.classes.providerName}>{provider.name}</h2>
      <p className={integrationStyles.classes.providerDescription}>{provider.description}</p>
    </Link>
  )
}

export function ServicesPage() {
  return (
    <>
      <PageHeader eyebrow="Integrations" title="Services" description="Connect the platforms you already deploy to. Each connection is private to your account and uses your own credentials." />
      <section className={integrationStyles.classes.providerGrid}>{providers.map(renderProvider)}</section>
    </>
  )
}
