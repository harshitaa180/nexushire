import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * The ambient page background: three slow-drifting colour fields, a faint
 * technical grid, and a film-grain overlay. Fixed-position and pointer-events
 * none, so it sits behind everything without interfering.
 */
export function Backdrop({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
    >
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, var(--glow-a), transparent 60%), radial-gradient(90% 60% at 100% 10%, var(--glow-b), transparent 55%), radial-gradient(80% 70% at 0% 90%, var(--glow-c), transparent 60%)',
          opacity: 0.55,
        }}
      />

      {/* Drifting orbs */}
      <Orb
        className="left-[-10%] top-[-12%] h-[46rem] w-[46rem]"
        color="var(--color-violet-glow)"
        delay={0}
        reduced={!!reduced}
      />
      <Orb
        className="right-[-14%] top-[18%] h-[38rem] w-[38rem]"
        color="var(--color-cyan-glow)"
        delay={2.5}
        reduced={!!reduced}
      />
      <Orb
        className="bottom-[-18%] left-[24%] h-[42rem] w-[42rem]"
        color="var(--color-mint-glow)"
        delay={5}
        reduced={!!reduced}
      />

      {/* Technical grid, faded toward the edges */}
      <div
        className="grid-lines absolute inset-0 opacity-[0.55]"
        style={{
          maskImage: 'radial-gradient(80% 60% at 50% 30%, black, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(80% 60% at 50% 30%, black, transparent 85%)',
        }}
      />

      {/* Film grain — an inline SVG turbulence, no network request */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay dark:opacity-[0.22]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette to seat the content */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(100% 100% at 50% 50%, transparent 40%, var(--bg-deep) 100%)',
          opacity: 0.7,
        }}
      />
    </div>
  )
}

function Orb({
  className,
  color,
  delay,
  reduced,
}: {
  className?: string
  color: string
  delay: number
  reduced: boolean
}) {
  return (
    <motion.div
      className={cn('absolute rounded-full blur-[110px]', className)}
      style={{ background: color, opacity: 0.24 }}
      animate={
        reduced
          ? undefined
          : {
              x: [0, 60, -30, 0],
              y: [0, -40, 30, 0],
              scale: [1, 1.12, 0.95, 1],
            }
      }
      transition={{ duration: 26, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/** A soft spotlight that follows a card on hover. Used inside JobCard. */
export function Spotlight({ color = '#7c5cff' }: { color?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background: `radial-gradient(600px circle at var(--mx, 50%) var(--my, 0%), ${color}22, transparent 42%)`,
      }}
    />
  )
}
