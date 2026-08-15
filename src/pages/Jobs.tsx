import { AnimatePresence, motion } from 'framer-motion'
import { SearchX, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { FilterBar } from '@/components/jobs/FilterBar'
import { JobCard } from '@/components/jobs/JobCard'
import { JobDetail } from '@/components/jobs/JobDetail'
import { Button, EmptyState } from '@/components/ui/primitives'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { COOL_BLOBS, PageBanner } from '@/components/visual/MediaBand'
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
      <PageBanner
        eyebrow={`Matched for ${profile.headline || 'you'}`}
        icon={<Sparkles className="h-3 w-3" />}
        title="Discover roles"
        blobs={COOL_BLOBS}
        body={
          rows.length > 0 ? (
            <>
              Your strongest match right now is{' '}
              <span className="font-semibold text-[var(--text)]">{best}%</span>. Open any card to see
              exactly how that number was built.
            </>
          ) : (
            'Nothing matches the current filters.'
          )
        }
        aside={rows.length > 0 ? <ScoreRing score={best} size={92} stroke={3} showLabel /> : undefined}
      />

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
