import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Backdrop } from '@/components/visual/Backdrop'
import { Insights } from '@/pages/Insights'
import { Jobs } from '@/pages/Jobs'
import { Landing } from '@/pages/Landing'
import { Profile } from '@/pages/Profile'
import { Tracker } from '@/pages/Tracker'
import { useAppStore } from '@/store/useAppStore'

export default function App() {
  const theme = useAppStore((st) => st.theme)
  const location = useLocation()

  // Theme lives on <html> so the CSS custom properties cascade to everything.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#07070c' : '#f6f7fb')
  }, [theme])

  // Reset scroll on navigation — AnimatePresence keeps the old page mounted
  // briefly, so this has to run on pathname change rather than on mount.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <>
      <Backdrop />
      <Navbar />

      <main className="relative min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/tracker" element={<Tracker />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </>
  )
}

function Footer() {
  return (
    <footer className="relative border-t border-[rgb(var(--border)/var(--border-alpha))] px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-[12px] text-faint">
        <span>
          <span className="font-display font-semibold text-[var(--text)]">NexusHire</span> — an
          explainable job-matching engine. All scoring runs client-side.
        </span>
        <span className="font-mono">React · TypeScript · Vite · Tailwind · Framer Motion</span>
      </div>
    </footer>
  )
}
