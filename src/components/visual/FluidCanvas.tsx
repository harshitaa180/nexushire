import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * A real-time animated colour field — the "video background".
 *
 * Rendered on a 2D canvas at a quarter of the display resolution and then
 * scaled up under a heavy CSS blur. That is the trick that makes it cheap:
 * a 480×270 buffer costs almost nothing to paint, and once it is blurred to
 * this degree nobody can tell it was ever low-res. The result is full motion
 * at 60fps for a few kilobytes, instead of a multi-megabyte video file that
 * would still be softer than this on a retina display.
 *
 * Also: pauses on tab-hide and on `prefers-reduced-motion`.
 */

export interface FluidBlob {
  color: string
  /** Base position in 0–1 space. */
  x: number
  y: number
  /** Radius as a fraction of the buffer's diagonal. */
  r: number
  /** Orbit radii in 0–1 space. */
  ax: number
  ay: number
  /** Angular speed multipliers. */
  sx: number
  sy: number
  phase: number
}

/** A saturated default set — violet, cyan, emerald, amber, rose, fuchsia. */
export const DEFAULT_BLOBS: FluidBlob[] = [
  { color: '#6d4aff', x: 0.22, y: 0.28, r: 0.42, ax: 0.1, ay: 0.08, sx: 0.11, sy: 0.15, phase: 0 },
  { color: '#06b6d4', x: 0.78, y: 0.22, r: 0.38, ax: 0.12, ay: 0.09, sx: 0.14, sy: 0.1, phase: 1.7 },
  { color: '#10b981', x: 0.7, y: 0.76, r: 0.36, ax: 0.11, ay: 0.1, sx: 0.09, sy: 0.13, phase: 3.1 },
  { color: '#f59e0b', x: 0.28, y: 0.8, r: 0.32, ax: 0.09, ay: 0.11, sx: 0.16, sy: 0.08, phase: 4.4 },
  { color: '#c026d3', x: 0.5, y: 0.5, r: 0.34, ax: 0.14, ay: 0.12, sx: 0.07, sy: 0.11, phase: 5.6 },
  { color: '#f43f5e', x: 0.9, y: 0.6, r: 0.28, ax: 0.08, ay: 0.13, sx: 0.13, sy: 0.09, phase: 2.4 },
]

export function FluidCanvas({
  blobs = DEFAULT_BLOBS,
  className,
  /** Multiplies every blob's alpha. Lower for backgrounds, higher for hero panels. */
  intensity = 1,
  /** Buffer scale relative to the element. Smaller is cheaper and softer. */
  scale = 0.25,
  blur = 44,
  speed = 1,
}: {
  blobs?: FluidBlob[]
  className?: string
  intensity?: number
  scale?: number
  blur?: number
  speed?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let frame = 0
    let start = performance.now()
    let paused = document.hidden

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width * scale))
      height = Math.max(1, Math.round(rect.height * scale))
      canvas.width = width
      canvas.height = height
    }

    const draw = (now: number) => {
      const t = ((now - start) / 1000) * speed
      ctx.clearRect(0, 0, width, height)

      // 'lighter' additively blends the fields, so overlaps bloom into new
      // hues rather than muddying — this is where the colour richness comes from.
      ctx.globalCompositeOperation = 'lighter'
      const diagonal = Math.hypot(width, height)

      for (const blob of blobs) {
        const cx = (blob.x + Math.cos(t * blob.sx + blob.phase) * blob.ax) * width
        const cy = (blob.y + Math.sin(t * blob.sy + blob.phase) * blob.ay) * height
        // Gentle breathing so the field never looks like a static gradient.
        const radius = blob.r * diagonal * (0.9 + 0.1 * Math.sin(t * 0.23 + blob.phase))

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        gradient.addColorStop(0, hexToRgba(blob.color, 0.55 * intensity))
        gradient.addColorStop(0.45, hexToRgba(blob.color, 0.22 * intensity))
        gradient.addColorStop(1, hexToRgba(blob.color, 0))

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (now: number) => {
      if (!paused) draw(now)
      frame = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      paused = document.hidden
      // Rebase the clock so the field doesn't jump after a long hide.
      if (!paused) start = performance.now() - 1
    }

    const observer = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })

    resize()

    if (reduced) {
      // Paint one static frame and stop.
      draw(performance.now() + 4000)
    } else {
      observer.observe(canvas)
      document.addEventListener('visibilitychange', onVisibility)
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [blobs, intensity, scale, speed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('h-full w-full', className)}
      style={{ filter: `blur(${blur}px) saturate(1.35)`, transform: 'translateZ(0)' }}
    />
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const value = parseInt(hex.slice(1), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r},${g},${b},${alpha})`
}
