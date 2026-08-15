import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { MATCH_TIERS, tierFor } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: number
  stroke?: number
  /** Show the tier label beneath the number. */
  showLabel?: boolean
  className?: string
  delay?: number
}

/**
 * The match score dial. An SVG arc that sweeps to the score with a spring,
 * a counting numeral, and a soft glow tinted by the match tier. Deliberately
 * the loudest element on a job card — it is the product's core idea.
 */
export function ScoreRing({
  score,
  size = 76,
  stroke = 6,
  showLabel = false,
  className,
  delay = 0,
}: ScoreRingProps) {
  const tier = tierFor(score)
  const color = MATCH_TIERS[tier].color

  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const progress = useMotionValue(0)
  const dashOffset = useTransform(progress, (p) => circumference * (1 - p / 100))
  const display = useTransform(progress, (p) => Math.round(p))

  useEffect(() => {
    const controls = animate(progress, score, {
      duration: 1.15,
      delay,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [score, delay, progress])

  return (
    <div className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      {/* Ambient glow behind the ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: color, opacity: 0.28 }}
      />

      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Match score ${score} out of 100`}>
        <defs>
          <linearGradient id={`ring-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.65" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

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
          stroke={`url(#ring-${tier})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 6px ${color}aa)` }}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center leading-none">
          <div className="flex items-start font-display font-bold tabular-nums" style={{ color }}>
            <motion.span style={{ fontSize: size * 0.3 }}>{display}</motion.span>
            <span className="mt-[0.15em] opacity-60" style={{ fontSize: size * 0.16 }}>
              %
            </span>
          </div>
          {showLabel && (
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-faint">
              match
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/** Compact inline variant for dense lists — a pill instead of a dial. */
export function ScorePill({ score, className }: { score: number; className?: string }) {
  const tier = tierFor(score)
  const color = MATCH_TIERS[tier].color

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
        className,
      )}
      style={{ color, background: `${color}1f`, border: `1px solid ${color}40` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {score}%
    </span>
  )
}
