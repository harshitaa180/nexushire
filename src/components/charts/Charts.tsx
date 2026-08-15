import { motion } from 'framer-motion'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * React's useId emits colons (`:r0:`), which are legal in HTML but awkward
 * inside SVG `url(#…)` fragment references. Strip them to keep the defs safe.
 */
function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
}

/* ══════════════════════════════ Radar ══════════════════════════════════ */

export interface RadarAxis {
  label: string
  /** 0–100 */
  value: number
}

/**
 * Facet radar. Hand-rolled rather than pulled from a charting library so the
 * grid, the fill gradient and the vertex dots all match the design system
 * exactly — and so the bundle stays small.
 */
export function RadarChart({
  axes,
  size = 260,
  color = '#7c5cff',
  className,
}: {
  axes: RadarAxis[]
  size?: number
  color?: string
  className?: string
}) {
  const gradientId = useSvgId('radar')
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 42
  const n = axes.length

  const pointAt = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const r = (value / 100) * maxR
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const
  }

  const polygon = axes.map((a, i) => pointAt(i, a.value).join(',')).join(' ')
  const rings = [25, 50, 75, 100]

  return (
    <svg width={size} height={size} className={cn('overflow-visible', className)} role="img" aria-label="Match facet radar">
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {/* Concentric grid */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, i) => pointAt(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="currentColor"
          className="text-faint"
          strokeOpacity={ring === 100 ? 0.28 : 0.13}
          strokeWidth={1}
        />
      ))}

      {/* Spokes */}
      {axes.map((_, i) => {
        const [x, y] = pointAt(i, 100)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="currentColor"
            className="text-faint"
            strokeOpacity={0.14}
          />
        )
      })}

      {/* The data shape */}
      <motion.polygon
        points={polygon}
        fill={`url(#${gradientId})`}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 10px ${color}70)`, transformOrigin: `${cx}px ${cy}px` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Vertices */}
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, a.value)
        return (
          <motion.circle
            key={a.label}
            cx={x}
            cy={y}
            r={3.5}
            fill={color}
            stroke="var(--bg)"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.06, type: 'spring', stiffness: 400, damping: 18 }}
          />
        )
      })}

      {/* Axis labels, nudged outward from the centre */}
      {axes.map((a, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        const lx = cx + Math.cos(angle) * (maxR + 22)
        const ly = cy + Math.sin(angle) * (maxR + 22)
        const anchor = Math.abs(Math.cos(angle)) < 0.3 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end'
        return (
          <text
            key={a.label}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-current text-[10px] font-medium text-muted"
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}

/* ══════════════════════════════ Donut ══════════════════════════════════ */

export interface DonutSlice {
  label: string
  value: number
  color: string
}

export function DonutChart({
  slices,
  size = 170,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  slices: DonutSlice[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string | number
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={thickness}
        />
        {slices.map((slice, i) => {
          const fraction = slice.value / total
          const dash = circumference * fraction
          const gap = circumference - dash
          const rotation = offset
          offset += fraction

          return (
            <motion.circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-circumference * rotation}
              initial={{ opacity: 0, strokeWidth: 0 }}
              animate={{ opacity: 1, strokeWidth: thickness }}
              transition={{ delay: i * 0.09, duration: 0.55, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 6px ${slice.color}80)` }}
            />
          )
        })}
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-bold tabular-nums">{centerValue}</div>
          <div className="text-[10px] uppercase tracking-widest text-faint">{centerLabel}</div>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════ Bar list ════════════════════════════════ */

export interface BarRow {
  label: string
  value: number
  /** Optional right-aligned annotation, e.g. "$142k avg". */
  hint?: string
  color: string
}

export function BarList({ rows, max }: { rows: BarRow[]; max?: number }) {
  const ceiling = max ?? Math.max(1, ...rows.map((r) => r.value))

  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative overflow-hidden rounded-lg"
        >
          {/* The bar sits behind the label — a "table with a heatmap" pattern */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-lg"
            style={{ background: `linear-gradient(90deg, ${row.color}33, ${row.color}12)` }}
            initial={{ width: 0 }}
            animate={{ width: `${(row.value / ceiling) * 100}%` }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex items-center justify-between px-3 py-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: row.color, boxShadow: `0 0 8px ${row.color}` }}
              />
              {row.label}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted">{row.hint ?? row.value}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ════════════════════════════ Sparkline ════════════════════════════════ */

export function Sparkline({
  points,
  width = 120,
  height = 34,
  color = '#22d3ee',
}: {
  points: number[]
  width?: number
  height?: number
  color?: string
}) {
  const gradientId = useSvgId('spark')
  if (points.length < 2) return null

  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p - min) / span) * (height - 4) - 2
    return [x, y] as const
  })

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 5px ${color}90)` }}
      />
    </svg>
  )
}

/* ═════════════════════════ Histogram (match dist) ══════════════════════ */

export function Histogram({ buckets, colors }: { buckets: number[]; colors: string[] }) {
  const max = Math.max(1, ...buckets)

  return (
    <div className="flex h-28 items-end gap-1.5">
      {buckets.map((count, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
          <motion.div
            className="w-full rounded-t-md"
            style={{
              background: `linear-gradient(180deg, ${colors[i]}, ${colors[i]}44)`,
              boxShadow: `0 0 14px -2px ${colors[i]}90`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(4, (count / max) * 100)}%` }}
            transition={{ delay: i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="text-[10px] tabular-nums text-faint">{count}</span>
        </div>
      ))}
    </div>
  )
}
