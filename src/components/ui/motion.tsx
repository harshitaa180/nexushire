import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared motion vocabulary. Everything here is deliberately restrained —
 * short distances, no bounce, no rotation. The goal is that the page feels
 * composed as it assembles, not that individual elements perform.
 */

/** The house easing curve. Fast out, long settle. */
export const EASE = [0.16, 1, 0.3, 1] as const

/* ═══════════════════════════ Reveal ════════════════════════════════════ */

export function Reveal({
  children,
  delay = 0,
  y = 18,
  once = true,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  once?: boolean
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Staggers direct children on scroll into view. */
export function RevealGroup({
  children,
  stagger = 0.08,
  delay = 0,
  className,
}: {
  children: ReactNode
  stagger?: number
  delay?: number
  className?: string
}) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  )
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

/* ══════════════════════ Word-by-word headline ══════════════════════════ */

/**
 * Splits a headline into words and raises each from behind a clipping mask.
 * Reads as typesetting rather than as an animation, which is the point.
 */
export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'span'
}) {
  const words = text.split(' ')
  const MotionTag = motion[Tag]

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '105%' },
              show: { y: 0, transition: { duration: 0.85, ease: EASE } },
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}

/* ═══════════════════════════ CountUp ═══════════════════════════════════ */

/** Animates to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  duration = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const count = useMotionValue(0)
  const text = useTransform(count, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, value, { duration, ease: EASE })
    return () => controls.stop()
  }, [inView, value, duration, count])

  return (
    <span ref={ref} className={cn('tnum', className)}>
      <motion.span>{text}</motion.span>
    </span>
  )
}

/* ═════════════════════════ Animated rule ═══════════════════════════════ */

/** A hairline that draws itself in from the left as it enters view. */
export function AnimatedRule({
  className,
  delay = 0,
  color,
  spectrum = false,
}: {
  className?: string
  delay?: number
  color?: string
  /** Paints the rule with the full accent ramp instead of a neutral hairline. */
  spectrum?: boolean
}) {
  return (
    <motion.div
      className={cn('h-px w-full origin-left', spectrum && 'rule-spectrum', className)}
      style={
        spectrum ? undefined : { background: color ?? 'rgb(var(--border) / var(--border-alpha))' }
      }
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1, delay, ease: EASE }}
    />
  )
}

/* ═══════════════════════ Scroll progress bar ═══════════════════════════ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          'linear-gradient(90deg, var(--color-violet), var(--color-cyan) 35%, var(--color-emerald) 65%, var(--color-amber))',
      }}
    />
  )
}

/* ════════════════════════════ Marquee ══════════════════════════════════ */

/** Seamless infinite row. Children are rendered twice; the track shifts -50%. */
export function Marquee({
  children,
  className,
  reverse = false,
}: {
  children: ReactNode
  className?: string
  reverse?: boolean
}) {
  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div
        className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

/* ═════════════════════════ Parallax wrapper ════════════════════════════ */

/** Shifts content slightly against the scroll for depth. */
export function Parallax({
  children,
  distance = 40,
  className,
}: {
  children: ReactNode
  distance?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

/* ══════════════════════════ Typewriter ═════════════════════════════════ */

/** Cycles through phrases a character at a time. Used in the hero subhead. */
export function Typewriter({ phrases, className }: { phrases: string[]; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = phrases[0]
      return
    }

    let phrase = 0
    let char = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = phrases[phrase]
      char += deleting ? -1 : 1
      node.textContent = current.slice(0, char)

      let wait = deleting ? 34 : 68
      if (!deleting && char === current.length) {
        wait = 1900
        deleting = true
      } else if (deleting && char === 0) {
        deleting = false
        phrase = (phrase + 1) % phrases.length
        wait = 320
      }
      timer = setTimeout(tick, wait)
    }

    timer = setTimeout(tick, 700)
    return () => clearTimeout(timer)
  }, [phrases])

  return (
    <span className={className}>
      <span ref={ref} />
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.12em] bg-current"
        style={{ animation: 'caret 1.1s step-end infinite' }}
      />
    </span>
  )
}
