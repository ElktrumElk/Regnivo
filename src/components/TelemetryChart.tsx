import { dashboardStyles } from '../styles/dashboardStyles.ts'

export function TelemetryChart() {
  return (
    <svg className={dashboardStyles.classes.chart} viewBox="0 0 720 220" role="img" aria-label="Requests and response time over the last 24 hours">
      <defs><linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b6ea64" stopOpacity=".18" /><stop offset="1" stopColor="#b6ea64" stopOpacity="0" /></linearGradient></defs>
      <g stroke="#252824" strokeWidth="1"><path d="M0 35H720M0 85H720M0 135H720M0 185H720" /></g>
      <path d="M0 156L30 148L60 161L90 125L120 133L150 113L180 132L210 109L240 98L270 119L300 84L330 95L360 79L390 93L420 65L450 75L480 47L510 73L540 59L570 83L600 52L630 67L660 41L690 54L720 31V220H0Z" fill="url(#pulse-fill)" />
      <path d="M0 156L30 148L60 161L90 125L120 133L150 113L180 132L210 109L240 98L270 119L300 84L330 95L360 79L390 93L420 65L450 75L480 47L510 73L540 59L570 83L600 52L630 67L660 41L690 54L720 31" fill="none" stroke="#b6ea64" strokeWidth="2" />
      <path d="M0 177L30 172L60 179L90 166L120 170L150 158L180 164L210 151L240 159L270 143L300 151L330 139L360 147L390 132L420 140L450 124L480 137L510 121L540 128L570 113L600 121L630 108L660 115L690 101L720 108" fill="none" stroke="#43a9ff" strokeWidth="1.5" />
    </svg>
  )
}
