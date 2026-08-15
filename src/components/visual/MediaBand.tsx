import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { FluidCanvas, type FluidBlob } from './FluidCanvas'
import { ParticleField } from './ParticleField'
import { cn } from '@/lib/utils'

/**
 * A full-bleed band with a live animated colour field behind it — the
 * "video background" treatment. Each instance can be tinted differently so
 * pages feel distinct while sharing one motion language.
 *
 * The canvas only animates while the band is on screen.
 */
export function MediaBand({
  children,
  blobs,
  className,
  intensity = 1.35,
  height = 'auto',
  particles = true,
  rounded = true,
}: {
  children?: ReactNode
  blobs?: FluidBlob[]
  className?: string
  intensity?: number
  height?: string
  particles?: boolean
  rounded?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-10%' })

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        rounded && 'rounded-4xl',
        'border border-[rgb(var(--border)/var(--border-alpha))]',
        className,
      )}
      style={{ height }}
    >
      {/* Live field */}
      <div aria-hidden className="absolute inset-0">
        {inView && <FluidCanvas blobs={blobs} intensity={intensity} blur={46} scale={0.3} speed={1.05} />}
      </div>

      {particles && (
        <div aria-hidden className="absolute inset-0 opacity-60">
          {inView && <ParticleField opacity={0.5} maxParticles={46} linkDistance={110} />}
        </div>
      )}

      {/* Readability scrim */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 80% at 50% 50%, rgb(var(--surface) / 0.62), rgb(var(--surface) / 0.34))',
        }}
      />

      <div className="relative">{children}</div>
    </div>
  )
}

/* ═══════════════════════ Palette presets ═══════════════════════════════ */

/** Cool violet → cyan. Used on the discover board. */
export const COOL_BLOBS: FluidBlob[] = [
  { color: '#6d4aff', x: 0.2, y: 0.4, r: 0.5, ax: 0.13, ay: 0.1, sx: 0.13, sy: 0.17, phase: 0 },
  { color: '#06b6d4', x: 0.62, y: 0.3, r: 0.46, ax: 0.14, ay: 0.12, sx: 0.16, sy: 0.11, phase: 1.9 },
  { color: '#0ea5e9', x: 0.88, y: 0.7, r: 0.4, ax: 0.1, ay: 0.13, sx: 0.1, sy: 0.14, phase: 3.6 },
]

/** Green → cyan. Used on insights. */
export const FRESH_BLOBS: FluidBlob[] = [
  { color: '#10b981', x: 0.25, y: 0.35, r: 0.48, ax: 0.12, ay: 0.11, sx: 0.12, sy: 0.15, phase: 0.4 },
  { color: '#06b6d4', x: 0.7, y: 0.6, r: 0.44, ax: 0.13, ay: 0.1, sx: 0.15, sy: 0.12, phase: 2.2 },
  { color: '#6d4aff', x: 0.9, y: 0.25, r: 0.36, ax: 0.11, ay: 0.14, sx: 0.09, sy: 0.16, phase: 4.1 },
]

/** Warm fuchsia → amber. Used on the profile builder. */
export const WARM_BLOBS: FluidBlob[] = [
  { color: '#c026d3', x: 0.22, y: 0.32, r: 0.46, ax: 0.12, ay: 0.1, sx: 0.14, sy: 0.12, phase: 1.1 },
  { color: '#f43f5e', x: 0.66, y: 0.28, r: 0.42, ax: 0.13, ay: 0.12, sx: 0.11, sy: 0.16, phase: 2.8 },
  { color: '#f59e0b', x: 0.8, y: 0.75, r: 0.44, ax: 0.1, ay: 0.13, sx: 0.16, sy: 0.1, phase: 4.9 },
]

/** Amber → rose. Used on the tracker. */
export const EMBER_BLOBS: FluidBlob[] = [
  { color: '#f59e0b', x: 0.24, y: 0.6, r: 0.46, ax: 0.12, ay: 0.11, sx: 0.13, sy: 0.14, phase: 0.9 },
  { color: '#f43f5e', x: 0.68, y: 0.34, r: 0.44, ax: 0.14, ay: 0.1, sx: 0.15, sy: 0.11, phase: 3.3 },
  { color: '#6d4aff', x: 0.92, y: 0.72, r: 0.36, ax: 0.09, ay: 0.13, sx: 0.1, sy: 0.15, phase: 5.2 },
]

/* ═══════════════════════════ Page banner ═══════════════════════════════ */

/**
 * The compact animated header every inner page sits under, so the live
 * background treatment isn't confined to the landing page.
 */
export function PageBanner({
  eyebrow,
  title,
  body,
  blobs,
  icon,
  aside,
}: {
  eyebrow: string
  title: string
  body: ReactNode
  blobs?: FluidBlob[]
  icon?: ReactNode
  aside?: ReactNode
}) {
  return (
    <MediaBand blobs={blobs} intensity={1.2} className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-end justify-between gap-6 px-6 py-9 sm:px-9 sm:py-11"
      >
        <div className="min-w-0">
          <div className="eyebrow mb-3 flex items-center gap-2 text-ink">
            {icon}
            {eyebrow}
          </div>
          <h1 className="font-display text-[clamp(1.9rem,4vw,2.85rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.7] text-muted">{body}</p>
        </div>
        {aside}
      </motion.div>
    </MediaBand>
  )
}
