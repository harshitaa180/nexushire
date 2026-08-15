import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn, hueFromString } from '@/lib/utils'

/* ─────────────────────────────── Button ─────────────────────────────── */

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'text-white shadow-[0_8px_30px_-8px_rgba(124,92,255,0.75)] bg-[linear-gradient(120deg,#7c5cff,#6d5cff_40%,#22d3ee)] hover:shadow-[0_12px_40px_-8px_rgba(124,92,255,0.95)]',
  outline: 'border-gradient hover:brightness-125',
  ghost: 'hover:bg-[rgb(var(--surface)/0.12)]',
  subtle: 'glass hover:brightness-125',
  danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-2xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  trailing?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'group/btn relative inline-flex shrink-0 items-center justify-center font-medium',
        'transition-[transform,box-shadow,filter,background-color] duration-200',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {trailing}
    </button>
  )
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-grid h-9 w-9 place-items-center rounded-xl glass',
        'transition-all duration-200 hover:brightness-125 active:scale-90',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ──────────────────────────────── Chip ──────────────────────────────── */

export function Chip({
  children,
  color,
  active,
  onClick,
  className,
  title,
}: {
  children: ReactNode
  color?: string
  active?: boolean
  onClick?: () => void
  className?: string
  title?: string
}) {
  const interactive = Boolean(onClick)
  const Tag = interactive ? 'button' : 'span'

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none',
        'border transition-all duration-200',
        interactive && 'hover:scale-[1.04] active:scale-95 cursor-pointer',
        active
          ? 'text-white shadow-[0_2px_14px_-2px_rgba(124,92,255,0.6)]'
          : 'text-muted border-[rgb(var(--border)/var(--border-alpha))] bg-[rgb(var(--surface)/0.08)]',
        className,
      )}
      style={
        active
          ? {
              background: color
                ? `linear-gradient(120deg, ${color}, ${color}cc)`
                : 'linear-gradient(120deg,#7c5cff,#22d3ee)',
              borderColor: 'transparent',
            }
          : color
            ? { color, borderColor: `${color}44`, background: `${color}14` }
            : undefined
      }
    >
      {children}
    </Tag>
  )
}

/* ──────────────────────────────── Card ──────────────────────────────── */

export function Card({
  className,
  children,
  ...props
}: HTMLMotionProps<'div'> & { children?: ReactNode }) {
  return (
    <motion.div className={cn('glass rounded-3xl', className)} {...props}>
      {children}
    </motion.div>
  )
}

/* ───────────────────────────── Company mark ─────────────────────────── */

/** Deterministic gradient avatar built from the company name — no image assets. */
export function CompanyMark({
  name,
  initials,
  size = 44,
  className,
}: {
  name: string
  initials: string
  size?: number
  className?: string
}) {
  const hue = hueFromString(name)
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-2xl font-display font-bold text-white',
        'ring-1 ring-white/15',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, hsl(${hue} 78% 58%), hsl(${(hue + 55) % 360} 82% 48%))`,
        boxShadow: `0 8px 26px -10px hsl(${hue} 80% 50% / 0.85)`,
      }}
    >
      {initials}
    </div>
  )
}

/* ──────────────────────────── Section header ────────────────────────── */

export function SectionLabel({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
      {icon}
      {children}
    </div>
  )
}

/* ─────────────────────────────── Meter ──────────────────────────────── */

/** A slim animated progress bar used throughout the breakdown panels. */
export function Meter({
  value,
  color = '#7c5cff',
  height = 6,
  delay = 0,
  track = true,
}: {
  value: number
  color?: string
  height?: number
  delay?: number
  track?: boolean
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ height, background: track ? 'var(--ring-track)' : 'transparent' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 12px ${color}80`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

/* ─────────────────────────────── Empty ──────────────────────────────── */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col items-center rounded-3xl px-8 py-16 text-center"
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#7c5cff33,#22d3ee33)] text-[#7c5cff]">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
