import { Search } from 'lucide-react'
import { shellStyles } from '../styles/shellStyles.ts'

export function Topbar() {
  return (
    <header className={shellStyles.classes.topbar}>
      <div className={shellStyles.classes.workspace}>
        <span className={shellStyles.classes.workspaceLabel}>Workspace</span>
        <span aria-hidden="true">/</span>
        <strong className={shellStyles.classes.workspaceName}>Production</strong>
      </div>
      <div className={shellStyles.classes.topActions}>
        <label className={shellStyles.classes.search}>
          <Search size={14} aria-hidden="true" />
          <input className={shellStyles.classes.searchInput} type="search" placeholder="Search monitors" />
          <span className={shellStyles.classes.shortcut}>⌘ K</span>
        </label>
        <div className={shellStyles.classes.live}><span className={shellStyles.classes.liveDot} />Systems online</div>
      </div>
    </header>
  )
}
