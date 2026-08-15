import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Briefcase,
  KanbanSquare,
  Menu,
  Moon,
  Sun,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { IconButton } from '@/components/ui/primitives'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/jobs', label: 'Discover', icon: Briefcase },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/tracker', label: 'Tracker', icon: KanbanSquare },
]

export function Navbar() {
  const { theme, toggleTheme, applications } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const trackedCount = Object.keys(applications).length

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'py-2.5' : 'py-4',
        )}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6',
            'transition-all duration-300',
          )}
        >
          <div
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-3 py-2 transition-all duration-300',
              scrolled
                ? 'border border-[rgb(var(--border)/var(--border-alpha))] bg-[rgb(var(--surface)/0.88)] shadow-[var(--shadow-card)] backdrop-blur-xl'
                : 'border border-transparent',
            )}
          >
            <NavLink to="/" className="group flex items-center gap-2.5 pl-1 pr-2">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--ink)] transition-transform duration-300 group-hover:-rotate-3">
                <span className="font-display text-[17px] font-semibold leading-none text-[var(--bg)]">
                  N
                </span>
              </div>
              <span className="font-display text-[18px] font-semibold tracking-[-0.02em]">
                Nexus<span className="text-ink">Hire</span>
              </span>
            </NavLink>

            <div className="mx-auto hidden items-center gap-1 md:flex">
              {LINKS.map((link) => (
                <NavItem key={link.to} {...link} badge={link.to === '/tracker' ? trackedCount : 0} />
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <IconButton label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={toggleTheme}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    className="grid place-items-center"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-[var(--accent)]" />
                    ) : (
                      <Moon className="h-4 w-4 text-ink" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </IconButton>

              <IconButton
                label="Open menu"
                className="md:hidden"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </IconButton>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="glass-strong mx-4 mt-20 rounded-3xl p-3"
              onClick={(e) => e.stopPropagation()}
            >
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-[var(--ink-soft)] text-ink' : 'text-muted',
                    )
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
}: {
  to: string
  label: string
  icon: typeof Briefcase
  badge?: number
}) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <span
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 text-[13.5px] font-medium transition-colors duration-200',
            isActive ? 'text-[var(--text)]' : 'text-muted hover:text-[var(--text)]',
          )}
        >
          <Icon className="h-3.5 w-3.5 opacity-70" />
          <span>{label}</span>
          {Boolean(badge) && (
            <span className="grid h-4 min-w-4 place-items-center rounded-[3px] bg-[var(--ink)] px-1 text-[9.5px] font-semibold tnum text-[var(--bg)]">
              {badge}
            </span>
          )}
          {/* Editorial underline rather than a filled pill */}
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute inset-x-2 -bottom-0.5 h-[1.5px] rounded-full bg-[var(--ink)]"
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            />
          )}
        </span>
      )}
    </NavLink>
  )
}
