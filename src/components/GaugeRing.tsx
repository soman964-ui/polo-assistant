interface GaugeRingProps {
  /** 0..1 — доля израсходованного интервала */
  progress: number
  size?: number
  stroke?: number
  tone?: 'ok' | 'soon' | 'overdue' | 'unknown'
  children?: React.ReactNode
}

const TONES = {
  ok: 'hsl(152 60% 45%)',
  soon: 'hsl(38 95% 55%)',
  overdue: 'hsl(4 78% 56%)',
  unknown: 'hsl(216 12% 45%)',
}

/** Кольцевой индикатор в стиле приборной шкалы */
export default function GaugeRing({ progress, size = 132, stroke = 9, tone = 'ok', children }: GaugeRingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, progress))
  const offset = c * (1 - clamped)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(220 14% 16%)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TONES[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms ease-out, stroke 200ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
