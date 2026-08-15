import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Briefcase,
  KanbanSquare,
  Menu,
  Moon,
  Sparkles,
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
              scrolled ? 'glass-strong' : 'border border-transparent',
            )}
          >
            <NavLink to="/" className="group flex items-center gap-2.5 pl-1 pr-2">
              <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#7c5cff,#22d3ee)] shadow-[0_6px_20px_-6px_rgba(124,92,255,0.9)]">
                <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
                <div className="absolute inset-0 rounded-xl bg-[linear-gradient(135deg,#7c5cff,#22d3ee)] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-80" />
              </div>
              <span className="font-display text-[17px] font-bold tracking-tight">
                Nexus<span className="text-gradient">Hire</span>
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
                      <Sun className="h-4 w-4 text-amber-300" />
                    ) : (
                      <Moon className="h-4 w-4 text-indigo-500" />
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
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-[rgb(var(--surface)/0.16)] text-gradient' : 'text-muted',
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
            'relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-200',
            isActive ? 'text-[var(--text)]' : 'text-muted hover:text-[var(--text)]',
          )}
        >
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-xl bg-[rgb(var(--surface)/0.18)] ring-1 ring-[rgb(var(--border)/0.2)]"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <Icon className="relative h-4 w-4" />
          <span className="relative">{label}</span>
          {Boolean(badge) && (
            <span className="relative grid h-4 min-w-4 place-items-center rounded-full bg-[linear-gradient(120deg,#7c5cff,#22d3ee)] px-1 text-[10px] font-bold text-white">
              {badge}
            </span>
          )}
        </span>
      )}
    </NavLink>
  )
}
