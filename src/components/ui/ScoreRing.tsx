import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { MATCH_TIERS, tierFor } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: number
  stroke?: number
  showLabel?: boolean
  className?: string
  delay?: number
}

/**
 * The match dial. A thin arc that sweeps to the score with a counting numeral
 * and a set of minute ticks behind it — closer to a gauge on an instrument
 * than to a progress ring. No glow; the emphasis comes from weight and space.
 */
export function ScoreRing({
  score,
  size = 76,
  stroke = 3,
  showLabel = false,
  className,
  delay = 0,
}: ScoreRingProps) {
  const tier = tierFor(score)
  const color = MATCH_TIERS[tier].color

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })

  const radius = (size - stroke) / 2 - 3
  const circumference = 2 * Math.PI * radius

  const progress = useMotionValue(0)
  const dashOffset = useTransform(progress, (p) => circumference * (1 - p / 100))
  const display = useTransform(progress, (p) => Math.round(p))

  useEffect(() => {
    if (!inView) return
    const controls = animate(progress, score, { duration: 1.3, delay, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [score, delay, progress, inView])

  // 40 minute ticks around the dial face.
  const ticks = Array.from({ length: 40 }, (_, i) => (i * 360) / 40)

  return (
    <div
      ref={ref}
      className={cn('relative grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={`Match score ${score} out of 100`}
      >
        {/* Tick ring */}
        <g opacity={0.35}>
          {ticks.map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const outer = size / 2 - 1
            const inner = outer - (i % 5 === 0 ? 4 : 2)
            return (
              <line
                key={angle}
                x1={size / 2 + Math.cos(rad) * inner}
                y1={size / 2 + Math.sin(rad) * inner}
                x2={size / 2 + Math.cos(rad) * outer}
                y2={size / 2 + Math.sin(rad) * outer}
                stroke="currentColor"
                className="text-faint"
                strokeWidth={0.75}
              />
            )
          })}
        </g>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center leading-none">
          <div className="flex items-start font-display font-semibold tnum" style={{ color }}>
            <motion.span style={{ fontSize: size * 0.31 }}>{display}</motion.span>
            <span className="mt-[0.2em] opacity-55" style={{ fontSize: size * 0.15 }}>
              %
            </span>
          </div>
          {showLabel && (
            <span className="eyebrow mt-1 text-[8px] text-faint">match</span>
          )}
        </div>
      </div>
    </div>
  )
}

/** Compact inline variant for dense lists. */
export function ScorePill({ score, className }: { score: number; className?: string }) {
  const tier = tierFor(score)
  const color = MATCH_TIERS[tier].color

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[11px] font-semibold tnum',
        className,
      )}
      style={{ color, background: `${color}12`, border: `1px solid ${color}33` }}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: color }} />
      {score}%
    </span>
  )
}
