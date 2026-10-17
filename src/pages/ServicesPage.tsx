import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader.tsx'
import { PROVIDERS } from '../services/providers.ts'
import type { ProviderConfig } from '../services/providers.ts'
import { integrationStyles } from '../styles/integrationStyles.ts'

function renderProvider(provider: ProviderConfig) {
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
      <section className={integrationStyles.classes.providerGrid}>{PROVIDERS.map(renderProvider)}</section>
    </>
  )
}
