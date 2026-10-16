import { useState } from 'react'
import type { MouseEvent } from 'react'
import { X } from 'lucide-react'
import { logStyles } from '../styles/logStyles.ts'
import type { CheckResult } from '../types/api.ts'
import { formatBytes } from '../utils/format.ts'

type DetailTab = 'headers' | 'request' | 'timing' | 'response'

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'headers', label: 'Headers' },
  { id: 'request', label: 'Request' },
  { id: 'timing', label: 'Timing' },
  { id: 'response', label: 'Response' },
]

const TIMING_LABELS: Array<{ key: string; label: string }> = [
  { key: 'dnsMs', label: 'DNS lookup' },
  { key: 'connectMs', label: 'TCP connect' },
  { key: 'tlsMs', label: 'TLS handshake' },
  { key: 'ttfbMs', label: 'Time to first byte' },
  { key: 'totalMs', label: 'Total' },
]

interface HeaderListProps { title: string; headers: Record<string, string> | undefined }

function HeaderList({ title, headers }: HeaderListProps) {
  const entries = headers ? Object.entries(headers).sort(([a], [b]) => a.localeCompare(b)) : []
  return (
    <section className={logStyles.classes.detailSection}>
      <h4 className={logStyles.classes.detailSectionTitle}>{title}</h4>
      {entries.length === 0 ? <p className={logStyles.classes.muted}>No headers recorded.</p> : (
        <ul className={logStyles.classes.kvList}>
          {entries.map(([name, value]) => (
            <li key={name} className={logStyles.classes.kvRow}>
              <span className={logStyles.classes.kvKey}>{name}</span>
              <span className={logStyles.classes.kvValue}>{value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface TimingListProps { timing: Record<string, number> | undefined; durationMs: number }

function TimingList({ timing, durationMs }: TimingListProps) {
  function valueFor(key: string): number {
    if (key === 'totalMs') return timing?.totalMs ?? durationMs
    return timing?.[key] ?? 0
  }
  return (
    <div className={logStyles.classes.detailColumn}>
      {TIMING_LABELS.map(item => (
        <div key={item.key} className={logStyles.classes.timingRow}>
          <span className={logStyles.classes.timingLabel}>{item.label}</span>
          <span className={logStyles.classes.timingValue}>{valueFor(item.key)} ms</span>
        </div>
      ))}
    </div>
  )
}

interface LogDetailPanelProps { result: CheckResult; onClose: () => void }

export function LogDetailPanel({ result, onClose }: LogDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('headers')

  function handleTabClick(event: MouseEvent<HTMLButtonElement>) {
    const tab = event.currentTarget.dataset.tab as DetailTab | undefined
    if (tab) setActiveTab(tab)
  }

  const isSuccess = result.outcome === 'success'
  const statusLabel = result.statusCode ? String(result.statusCode) : 'no response'
  const outcomeLabel = isSuccess ? 'success' : (result.errorCode ?? 'failure')

  return (
    <aside className={logStyles.classes.detailPanel} aria-label="Request details">
      <header className={logStyles.classes.detailHeader}>
        <div>
          <h3 className={logStyles.classes.detailTitle}>{result.method} · {statusLabel} · {result.durationMs} ms</h3>
          <p className={logStyles.classes.detailSubtitle}>{result.url}</p>
          <p className={logStyles.classes.detailSubtitle}>{new Date(result.startedAt).toLocaleString()} · {outcomeLabel}{result.message ? ` · ${result.message}` : ''}</p>
        </div>
        <button className={logStyles.classes.detailClose} type="button" onClick={onClose} aria-label="Close details"><X size={14} /></button>
      </header>
      <div className={logStyles.classes.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${logStyles.classes.tab} ${activeTab === tab.id ? logStyles.classes.tabActive : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            data-tab={tab.id}
            onClick={handleTabClick}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={logStyles.classes.tabPanel} role="tabpanel">
        {activeTab === 'headers' ? (
          <div className={logStyles.classes.detailColumn}>
            <HeaderList title="Request headers" headers={result.requestHeaders} />
            <HeaderList title="Response headers" headers={result.responseHeaders} />
          </div>
        ) : null}
        {activeTab === 'request' ? (
          <div className={logStyles.classes.detailColumn}>
            <section className={logStyles.classes.detailSection}>
              <h4 className={logStyles.classes.detailSectionTitle}>Request line</h4>
              <p className={logStyles.classes.kvValue}>{result.method} {result.url}</p>
            </section>
            <section className={logStyles.classes.detailSection}>
              <h4 className={logStyles.classes.detailSectionTitle}>Request body</h4>
              {result.requestBody ? <pre className={logStyles.classes.body}>{result.requestBody}</pre> : <p className={logStyles.classes.muted}>No request body was sent.</p>}
            </section>
            <section className={logStyles.classes.detailSection}>
              <h4 className={logStyles.classes.detailSectionTitle}>Payload size</h4>
              <p className={logStyles.classes.kvValue}>{formatBytes(result.requestSize ?? 0)}</p>
            </section>
          </div>
        ) : null}
        {activeTab === 'timing' ? <TimingList timing={result.timingMs} durationMs={result.durationMs} /> : null}
        {activeTab === 'response' ? (
          <div className={logStyles.classes.detailColumn}>
            <section className={logStyles.classes.detailSection}>
              <h4 className={logStyles.classes.detailSectionTitle}>Status</h4>
              <p className={logStyles.classes.kvValue}>{statusLabel} · {formatBytes(result.responseSize ?? result.bytesReceived)}</p>
              {result.error ? <p className={logStyles.classes.muted}>{result.error}</p> : null}
            </section>
            <section className={logStyles.classes.detailSection}>
              <h4 className={logStyles.classes.detailSectionTitle}>Response body</h4>
              {result.responseBody ? <pre className={logStyles.classes.body}>{result.responseBody}</pre> : <p className={logStyles.classes.muted}>No response body recorded.</p>}
            </section>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
