import { FluidCanvas } from './FluidCanvas'
import { ParticleField } from './ParticleField'
import { cn } from '@/lib/utils'

/**
 * The page ground: a live animated colour field with a drifting particle
 * layer over it. Both are canvases running at 60fps, so the background is
 * genuinely moving video rather than a static image or a CSS grid.
 */
export function Backdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
    >
      {/* Live colour field */}
      <div className="absolute inset-0 opacity-[0.55] dark:opacity-40">
        <FluidCanvas intensity={0.9} blur={52} scale={0.22} speed={0.85} />
      </div>

      {/* Particle constellation */}
      <div className="absolute inset-0 opacity-70">
        <ParticleField opacity={0.42} maxParticles={80} />
      </div>

      {/* Grain keeps the gradients from banding on wide displays */}
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-multiply dark:opacity-[0.2] dark:mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Softens the field behind body copy so text stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, rgb(var(--surface) / 0.55) 20%, transparent 70%), radial-gradient(100% 100% at 50% 50%, transparent 45%, var(--bg-deep) 100%)',
        }}
      />
    </div>
  )
}

/** A soft highlight that follows the cursor across a card. */
export function Spotlight({ color = '#6d4aff' }: { color?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background: `radial-gradient(540px circle at var(--mx, 50%) var(--my, 0%), ${color}1f, transparent 45%)`,
      }}
    />
  )
}
