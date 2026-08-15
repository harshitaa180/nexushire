import { useMemo } from 'react'
import { JOBS } from '@/lib/jobs'
import { buildCorpus, matchAll } from '@/lib/matching'
import { normalise, skillLabel } from '@/lib/skills'
import type { Job, MatchResult } from '@/lib/types'
import { useAppStore, type Filters } from '@/store/useAppStore'

/** The IDF table only depends on the corpus, so build it exactly once. */
const CORPUS = buildCorpus(JOBS)

/** Score every job against the current profile. Recomputes only when the profile changes. */
export function useMatches(): Map<string, MatchResult> {
  const profile = useAppStore((st) => st.profile)
  return useMemo(() => matchAll(JOBS, profile, CORPUS), [profile])
}

export interface ScoredJob {
  job: Job
  match: MatchResult
}

/** Filtered + sorted job list, joined with its match result. */
export function useFilteredJobs(): ScoredJob[] {
  const matches = useMatches()
  const filters = useAppStore((st) => st.filters)

  return useMemo(() => {
    const rows: ScoredJob[] = JOBS.map((job) => ({ job, match: matches.get(job.id)! }))
    return sortJobs(rows.filter((row) => passesFilters(row, filters)), filters.sort)
  }, [matches, filters])
}

function passesFilters({ job, match }: ScoredJob, filters: Filters): boolean {
  if (filters.seniority.length && !filters.seniority.includes(job.seniority)) return false
  if (filters.workModes.length && !filters.workModes.includes(job.workMode)) return false
  if (filters.employmentTypes.length && !filters.employmentTypes.includes(job.employmentType)) return false
  if (filters.tags.length && !job.tags.some((t) => filters.tags.includes(t))) return false
  if (job.salaryMax < filters.minSalary) return false
  if (match.score < filters.minMatch) return false

  if (filters.query.trim()) {
    // Search across title, company, location, tags and the resolved skill labels
    // so typing "typescript" or "remote" both work.
    const haystack = normalise(
      [
        job.title,
        job.company,
        job.location,
        job.blurb,
        ...job.tags,
        ...job.skills.map((s) => skillLabel(s.id)),
      ].join(' '),
    )
    const needles = normalise(filters.query).split(' ').filter(Boolean)
    if (!needles.every((n) => haystack.includes(n))) return false
  }

  return true
}

function sortJobs(rows: ScoredJob[], sort: Filters['sort']): ScoredJob[] {
  const sorted = [...rows]
  switch (sort) {
    case 'recent':
      return sorted.sort((a, b) => a.job.postedDaysAgo - b.job.postedDaysAgo)
    case 'salary':
      return sorted.sort((a, b) => b.job.salaryMax - a.job.salaryMax)
    case 'competition':
      return sorted.sort((a, b) => a.job.applicants - b.job.applicants)
    case 'match':
    default:
      // Tie-break on recency so equal scores still feel deliberately ordered.
      return sorted.sort(
        (a, b) => b.match.score - a.match.score || a.job.postedDaysAgo - b.job.postedDaysAgo,
      )
  }
}
