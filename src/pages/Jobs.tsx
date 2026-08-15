import { AnimatePresence, motion } from 'framer-motion'
import { SearchX, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { FilterBar } from '@/components/jobs/FilterBar'
import { JobCard } from '@/components/jobs/JobCard'
import { JobDetail } from '@/components/jobs/JobDetail'
import { Button, EmptyState } from '@/components/ui/primitives'
import { useFilteredJobs } from '@/hooks/useMatches'
import { useAppStore } from '@/store/useAppStore'

export function Jobs() {
  const rows = useFilteredJobs()
  const clearFilters = useAppStore((st) => st.clearFilters)
  const profile = useAppStore((st) => st.profile)
  const [openId, setOpenId] = useState<string | null>(null)

  const open = rows.find((r) => r.job.id === openId) ?? null
  const best = rows[0]?.match.score ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7c5cff]">
          <Sparkles className="h-3 w-3" />
          Matched for {profile.headline || 'you'}
        </div>
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">
          Discover roles
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">
          {rows.length > 0 ? (
            <>
              Your strongest match right now is{' '}
              <span className="font-semibold text-[var(--text)]">{best}%</span>. Open any card to see
              exactly how that number was built.
            </>
          ) : (
            'Nothing matches the current filters.'
          )}
        </p>
      </motion.div>

      <FilterBar resultCount={rows.length} />

      {/* Results grid */}
      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-6 w-6" />}
            title="No roles match those filters"
            body="Try widening the salary floor or clearing a few filters — the corpus has 26 roles in total."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {rows.map(({ job, match }, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  match={match}
                  index={i}
                  onOpen={() => setOpenId(job.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <JobDetail job={open?.job ?? null} match={open?.match ?? null} onClose={() => setOpenId(null)} />
    </div>
  )
}
