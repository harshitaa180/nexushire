import { AnimatePresence, motion } from 'framer-motion'
import {
  Banknote,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  MapPin,
  Send,
  Users,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { MatchBreakdown } from './MatchBreakdown'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Button, Chip, CompanyMark, SectionLabel } from '@/components/ui/primitives'
import {
  SENIORITY_LABEL,
  WORK_MODE_LABEL,
  type Job,
  type MatchResult,
} from '@/lib/types'
import { formatSalary, relativeDay } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

interface JobDetailProps {
  job: Job | null
  match: MatchResult | null
  onClose: () => void
}

export function JobDetail({ job, match, onClose }: JobDetailProps) {
  const { applications, toggleSaved, setStage } = useAppStore()

  // Lock body scroll and wire up Escape while the panel is open.
  useEffect(() => {
    if (!job) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [job, onClose])

  const application = job ? applications[job.id] : undefined
  const tracked = Boolean(application)
  const applied = application && application.stage !== 'saved'

  return (
    <AnimatePresence>
      {job && match && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${job.title} at ${job.company}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-2xl flex-col glass-strong"
          >
            {/* Header */}
            <header className="relative shrink-0 overflow-hidden border-b border-[rgb(var(--border)/var(--border-alpha))] px-6 pb-5 pt-6">
              <div
                aria-hidden
                className="absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
                style={{ background: 'var(--color-violet-glow)', opacity: 0.22 }}
              />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl glass transition-transform hover:scale-105 active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative flex items-start gap-4 pr-12">
                <CompanyMark name={job.company} initials={job.companyLogo} size={54} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-bold leading-tight">{job.title}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                    <span className="font-medium text-[var(--text)]">{job.company}</span>
                    <span className="text-faint">·</span>
                    <span>{job.location}</span>
                    <span className="text-faint">·</span>
                    <span className="text-faint">{relativeDay(job.postedDaysAgo)}</span>
                  </p>
                </div>
                <ScoreRing score={match.score} size={78} stroke={6} showLabel delay={0.15} />
              </div>

              <div className="relative mt-4 flex flex-wrap gap-1.5">
                <Chip color="#7c5cff">{SENIORITY_LABEL[job.seniority]}</Chip>
                <Chip color="#22d3ee">{WORK_MODE_LABEL[job.workMode]}</Chip>
                <Chip color="#34d399">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</Chip>
                <Chip color="#fbbf24">{job.employmentType}</Chip>
                {job.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            </header>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <MatchBreakdown match={match} />

              <div className="my-7 h-px bg-[rgb(var(--border)/var(--border-alpha))]" />

              <SectionLabel icon={<Briefcase className="h-3 w-3" />}>About the role</SectionLabel>
              <p className="text-[14px] leading-relaxed text-muted">{job.description}</p>

              <div className="mt-6">
                <SectionLabel>What you'll do</SectionLabel>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted"
                    >
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#34d399]" strokeWidth={3} />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <SectionLabel>Perks</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {job.perks.map((perk) => (
                    <Chip key={perk} color="#34d399">
                      {perk}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FactTile icon={<Building2 className="h-4 w-4" />} label="Team size" value={`${job.teamSize}`} />
                <FactTile icon={<Users className="h-4 w-4" />} label="Applicants" value={`${job.applicants}`} />
                <FactTile
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Min. experience"
                  value={`${job.minYears} yrs`}
                />
                <FactTile
                  icon={<MapPin className="h-4 w-4" />}
                  label="Work mode"
                  value={WORK_MODE_LABEL[job.workMode]}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-[rgb(var(--border)/0.3)] p-4">
                <div className="flex items-center gap-2 text-[13px] font-medium">
                  <Banknote className="h-4 w-4 text-[#34d399]" />
                  Compensation band
                </div>
                <SalaryBand job={job} />
              </div>
            </div>

            {/* Sticky footer actions */}
            <footer className="shrink-0 border-t border-[rgb(var(--border)/var(--border-alpha))] bg-[rgb(var(--surface)/0.06)] px-6 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="subtle"
                  size="lg"
                  onClick={() => toggleSaved(job.id)}
                  icon={tracked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                >
                  {tracked ? 'Saved' : 'Save'}
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={Boolean(applied)}
                  onClick={() => setStage(job.id, 'applied')}
                  icon={<Send className="h-4 w-4" />}
                >
                  {applied ? 'Application tracked' : 'Apply & track'}
                </Button>
              </div>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function FactTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl glass px-3 py-3">
      <div className="mb-1.5 text-faint">{icon}</div>
      <div className="font-display text-[15px] font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[10.5px] uppercase tracking-wider text-faint">{label}</div>
    </div>
  )
}

/** Visualises where the candidate's salary target sits inside the posted band. */
function SalaryBand({ job }: { job: Job }) {
  const target = useAppStore((st) => st.profile.minSalary)
  const lo = Math.min(job.salaryMin, target) * 0.92
  const hi = Math.max(job.salaryMax, target) * 1.08
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100

  return (
    <div className="mt-4">
      <div className="relative h-2 rounded-full" style={{ background: 'var(--ring-track)' }}>
        <motion.div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${pct(job.salaryMin)}%`,
            background: 'linear-gradient(90deg,#34d39999,#34d399)',
            boxShadow: '0 0 14px #34d39980',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct(job.salaryMax) - pct(job.salaryMin)}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* The candidate's floor */}
        <div
          className="absolute -top-1 h-4 w-0.5 rounded-full bg-[#fbbf24]"
          style={{ left: `${pct(target)}%`, boxShadow: '0 0 10px #fbbf24' }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-faint">
        <span>${Math.round(job.salaryMin / 1000)}k</span>
        <span className="text-[#fbbf24]">your target ${Math.round(target / 1000)}k</span>
        <span>${Math.round(job.salaryMax / 1000)}k</span>
      </div>
    </div>
  )
}
