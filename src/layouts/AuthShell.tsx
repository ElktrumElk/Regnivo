import { RadioTower } from 'lucide-react'
import type { ReactNode } from 'react'
import { authStyles } from '../styles/authStyles.ts'

interface AuthShellProps { eyebrow: string; title: string; description: string; children: ReactNode }

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className={authStyles.classes.page}>
      <section className={authStyles.classes.shell}>
        <aside className={authStyles.classes.story}>
          <div className={authStyles.classes.brand}><span className={authStyles.classes.mark}><RadioTower size={16} /></span><span>Regnivo</span></div>
          <div className={authStyles.classes.statement}><h2 className={authStyles.classes.storyTitle}>Know before your users do.</h2><p className={authStyles.classes.storyText}>Independent server-side checks keep watch over every endpoint, even when your browser is closed.</p></div>
          <div className={authStyles.classes.signal}><span className={authStyles.classes.signalDot} />Server-side checks keep every endpoint visible</div>
        </aside>
        <div className={authStyles.classes.panel}>
          <header><p className={authStyles.classes.eyebrow}>{eyebrow}</p><h1 className={authStyles.classes.title}>{title}</h1><p className={authStyles.classes.subtitle}>{description}</p></header>
          {children}
        </div>
      </section>
    </main>
  )
}
