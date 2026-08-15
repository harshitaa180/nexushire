import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn, hueFromString } from '@/lib/utils'

/* ─────────────────────────────── Button ─────────────────────────────── */

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-[linear-gradient(110deg,#6d4aff,#5b3df0_45%,#06b6d4)] shadow-[0_6px_20px_-8px_rgba(109,74,255,0.75)] hover:shadow-[0_10px_28px_-8px_rgba(109,74,255,0.95)] hover:brightness-110',
  outline:
    'border border-[rgb(var(--border)/0.35)] text-[var(--text)] hover:bg-[var(--ink-soft)] hover:border-[rgb(var(--border)/0.5)]',
  ghost: 'text-muted hover:bg-[var(--ink-soft)] hover:text-[var(--text)]',
  subtle: 'glass hover:bg-[var(--ink-soft)]',
  danger:
    'border border-[#b0574a55] bg-[#b0574a12] text-[#b0574a] hover:bg-[#b0574a22]',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13.5px] gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[14px] gap-2.5 rounded-lg',
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
        'group/btn relative inline-flex shrink-0 items-center justify-center font-medium tracking-[-0.005em]',
        'transition-[transform,box-shadow,filter,background-color,border-color] duration-200',
        'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40',
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
        'inline-grid h-9 w-9 place-items-center rounded-lg',
        'border border-[rgb(var(--border)/var(--border-alpha))]',
        'transition-all duration-200 hover:bg-[var(--ink-soft)] active:scale-95',
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
        'inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[11px] font-medium leading-[1.45]',
        'border transition-all duration-200',
        interactive && 'cursor-pointer hover:-translate-y-px active:translate-y-0',
        active
          ? 'text-[var(--bg)]'
          : 'text-muted border-[rgb(var(--border)/var(--border-alpha))] bg-[rgb(var(--surface)/0.5)]',
        className,
      )}
      style={
        active
          ? { background: color ?? 'var(--ink)', borderColor: color ?? 'var(--ink)' }
          : color
            ? { color, borderColor: `${color}3d`, background: `${color}0f` }
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

/**
 * Deterministic monogram. Desaturated and squared off — closer to a letterhead
 * than an app icon, which is the whole point of the redesign.
 */
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
        'grid shrink-0 place-items-center rounded-md font-display font-semibold',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: '-0.02em',
        color: `hsl(${hue} 68% 38%)`,
        background: `linear-gradient(140deg, hsl(${hue} 92% 96%), hsl(${(hue + 40) % 360} 88% 92%))`,
        border: `1px solid hsl(${hue} 62% 84%)`,
      }}
    >
      {initials}
    </div>
  )
}

/* ──────────────────────────── Section header ────────────────────────── */

export function SectionLabel({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="eyebrow mb-3 flex items-center gap-2 text-faint">
      {icon}
      {children}
    </div>
  )
}

/* ─────────────────────────────── Meter ──────────────────────────────── */

export function Meter({
  value,
  color = 'var(--ink)',
  height = 4,
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
        style={{ background: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
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
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg border border-[rgb(var(--border)/var(--border-alpha))] bg-[var(--ink-soft)] text-ink">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
