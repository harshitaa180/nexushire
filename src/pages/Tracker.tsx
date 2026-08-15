import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, KanbanSquare, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, CompanyMark, EmptyState, SectionLabel } from '@/components/ui/primitives'
import { ScorePill } from '@/components/ui/ScoreRing'
import { EMBER_BLOBS, PageBanner } from '@/components/visual/MediaBand'
import { useMatches } from '@/hooks/useMatches'
import { JOBS } from '@/lib/jobs'
import { STAGES, STAGE_META, type ApplicationStage } from '@/lib/types'
import { cn, formatSalary } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const JOB_BY_ID = new Map(JOBS.map((j) => [j.id, j]))

export function Tracker() {
  const { applications, setStage, removeApplication } = useAppStore()
  const matches = useMatches()

  const entries = Object.values(applications)
  const byStage = (stage: ApplicationStage) =>
    entries
      .filter((a) => a.stage === stage)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <PageBanner
        eyebrow="Pipeline"
        icon={<KanbanSquare className="h-3 w-3" />}
        title="Application tracker"
        blobs={EMBER_BLOBS}
        body={
          entries.length === 0
            ? 'Save a role from the job board and it lands here.'
            : `${entries.length} ${entries.length === 1 ? 'role' : 'roles'} in flight. Move cards with the arrows — state persists in localStorage.`
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<KanbanSquare className="h-6 w-6" />}
          title="Nothing tracked yet"
          body="Bookmark a role from the discover board and it will appear here, ready to move through the pipeline."
          action={
            <Link to="/jobs">
              <Button>Browse roles</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((stage, stageIndex) => {
            const cards = byStage(stage)
            const meta = STAGE_META[stage]

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: stageIndex * 0.07 }}
                className="flex min-h-[16rem] flex-col rounded-3xl glass p-3.5"
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }}
                  />
                  <span className="text-[12.5px] font-semibold">{meta.label}</span>
                  <span className="ml-auto font-mono text-[11px] text-faint">{cards.length}</span>
                </div>
                <p className="mb-3 px-1 text-[10.5px] text-faint">{meta.hint}</p>

                <div className="flex-1 space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {cards.map((app) => {
                      const job = JOB_BY_ID.get(app.jobId)
                      const match = matches.get(app.jobId)
                      if (!job || !match) return null

                      return (
                        <motion.div
                          key={app.jobId}
                          layout
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                          className="group relative overflow-hidden rounded-2xl bg-[rgb(var(--surface)/0.1)] p-3"
                          style={{ borderLeft: `2px solid ${meta.color}` }}
                        >
                          <div className="flex items-start gap-2.5">
                            <CompanyMark name={job.company} initials={job.companyLogo} size={30} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12.5px] font-semibold leading-tight">
                                {job.title}
                              </div>
                              <div className="truncate text-[11px] text-faint">{job.company}</div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center gap-2">
                            <ScorePill score={match.score} className="!px-2 !py-0.5 !text-[10.5px]" />
                            <span className="truncate text-[10.5px] text-faint">
                              {formatSalary(job.salaryMin, job.salaryMax)}
                            </span>
                          </div>

                          {/* Stage controls — appear on hover, always reachable via keyboard */}
                          <div
                            className={cn(
                              'mt-2.5 flex items-center gap-1 opacity-0 transition-opacity',
                              'group-hover:opacity-100 focus-within:opacity-100',
                            )}
                          >
                            <StageButton
                              label="Move back"
                              disabled={stageIndex === 0}
                              onClick={() => setStage(app.jobId, STAGES[stageIndex - 1])}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </StageButton>
                            <StageButton
                              label="Move forward"
                              disabled={stageIndex === STAGES.length - 1}
                              onClick={() => setStage(app.jobId, STAGES[stageIndex + 1])}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </StageButton>
                            <StageButton
                              label="Remove from tracker"
                              className="ml-auto hover:!text-rose-400"
                              onClick={() => removeApplication(app.jobId)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </StageButton>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {cards.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[rgb(var(--border)/0.25)] px-3 py-6 text-center text-[11px] text-faint">
                      Empty
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pipeline summary */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-3xl glass p-5"
        >
          <SectionLabel>Pipeline health</SectionLabel>
          <div className="flex h-3 overflow-hidden rounded-full" style={{ background: 'var(--ring-track)' }}>
            {STAGES.map((stage) => {
              const count = byStage(stage).length
              if (count === 0) return null
              return (
                <motion.div
                  key={stage}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / entries.length) * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: STAGE_META[stage].color }}
                  title={`${STAGE_META[stage].label}: ${count}`}
                />
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {STAGES.map((stage) => (
              <span key={stage} className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: STAGE_META[stage].color }}
                />
                {STAGE_META[stage].label}
                <span className="font-mono tabular-nums text-faint">{byStage(stage).length}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function StageButton({
  children,
  label,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid h-6 w-6 place-items-center rounded-md text-faint transition-all',
        'hover:bg-[rgb(var(--surface)/0.2)] hover:text-[var(--text)] active:scale-90',
        'disabled:pointer-events-none disabled:opacity-25',
        className,
      )}
    >
      {children}
    </button>
  )
}
