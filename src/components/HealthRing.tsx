import { dashboardStyles } from '../styles/dashboardStyles.ts'

interface HealthRingProps { value: number }

export function HealthRing({ value }: HealthRingProps) {
  const dash = Math.max(0, Math.min(100, value)) * 2.64
  return (
    <svg className={dashboardStyles.classes.healthRing} viewBox="0 0 100 100" role="img" aria-label={`${value.toFixed(1)} percent success rate`}>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#252824" strokeWidth="7" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#b6ea64" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash} 264`} transform="rotate(-90 50 50)" />
      <text x="50" y="49" fill="#f2f4ec" fontSize="15" fontWeight="650" textAnchor="middle">{value.toFixed(1)}%</text>
      <text x="50" y="62" fill="#666b64" fontSize="6" textAnchor="middle">SUCCESS RATE</text>
    </svg>
  )
}
