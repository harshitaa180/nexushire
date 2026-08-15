import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Drifting particle layer with proximity links — the fine detail that sits on
 * top of the blurred colour field and keeps the page from looking like a
 * static gradient.
 *
 * Rendered at full resolution (it needs crisp 1px lines) but kept cheap by
 * capping the particle count by area and only testing each pair once.
 */
export function ParticleField({
  className,
  density = 0.00009,
  maxParticles = 90,
  linkDistance = 130,
  colors = ['#6d4aff', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'],
  opacity = 0.5,
}: {
  className?: string
  /** Particles per square pixel. */
  density?: number
  maxParticles?: number
  linkDistance?: number
  colors?: string[]
  opacity?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Cap DPR at 2 — beyond that the cost doubles for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let frame = 0
    let paused = document.hidden

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      r: number
      color: string
    }
    let particles: Particle[] = []

    const seed = () => {
      const count = Math.min(maxParticles, Math.round(width * height * density))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        // Wrap rather than bounce — bouncing creates visible edge clustering.
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = opacity
        ctx.fill()
      }

      // Link nearby particles, fading the stroke with distance.
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distSq = dx * dx + dy * dy
          if (distSq > linkDistance * linkDistance) continue

          const dist = Math.sqrt(distSq)
          ctx.globalAlpha = (1 - dist / linkDistance) * opacity * 0.35
          ctx.strokeStyle = a.color
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      ctx.globalAlpha = 1
    }

    const loop = () => {
      if (!paused) draw()
      frame = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      paused = document.hidden
    }

    const observer = new ResizeObserver(resize)
    resize()
    observer.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density, maxParticles, linkDistance, colors, opacity])

  return <canvas ref={canvasRef} aria-hidden className={cn('h-full w-full', className)} />
}
