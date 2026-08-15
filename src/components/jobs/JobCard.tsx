import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Check, MapPin, Sparkles, TrendingUp, Users } from 'lucide-react'
import type { MouseEvent } from 'react'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Chip, CompanyMark } from '@/components/ui/primitives'
import { Spotlight } from '@/components/visual/Backdrop'
import { skillColor } from '@/lib/skills'
import { MATCH_TIERS, WORK_MODE_LABEL, type Job, type MatchResult } from '@/lib/types'
import { cn, formatSalary, relativeDay } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

interface JobCardProps {
  job: Job
  match: MatchResult
  index: number
  onOpen: () => void
}

export function JobCard({ job, match, index, onOpen }: JobCardProps) {
  const { applications, toggleSaved } = useAppStore()
  const tracked = Boolean(applications[job.id])
  const tierColor = MATCH_TIERS[match.tier].color

  // Feed the pointer position into CSS vars so the spotlight follows the cursor.
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const topSkills = [...match.matched.slice(0, 4), ...match.missing.slice(0, 2)]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.045, 0.4), ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-3xl glass p-5',
        'transition-[transform,box-shadow] duration-300 hover:-translate-y-1',
        'hover:shadow-[0_28px_60px_-28px_rgba(0,0,0,0.6)]',
      )}
    >
      <Spotlight color={tierColor} />

      {/* Tier accent along the top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${tierColor}, transparent)` }}
      />

      {job.featured && (
        <div className="absolute right-0 top-0 overflow-hidden rounded-bl-2xl rounded-tr-3xl bg-[linear-gradient(120deg,#7c5cff,#22d3ee)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Featured
        </div>
      )}

      <div className="relative flex items-start gap-4">
        <CompanyMark name={job.company} initials={job.companyLogo} size={46} />

        <div className="min-w-0 flex-1 pr-2">
          <h3 className="truncate font-display text-[17px] font-semibold leading-tight">{job.title}</h3>
          <p className="mt-0.5 truncate text-sm text-muted">
            {job.company} · <span className="text-faint">{relativeDay(job.postedDaysAgo)}</span>
          </p>
        </div>

        <ScoreRing score={match.score} size={62} stroke={5} delay={Math.min(index * 0.05, 0.4)} />
      </div>

      <p className="relative mt-3.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{job.blurb}</p>

      {/* Meta row */}
      <div className="relative mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-faint">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {job.applicants} applicants
        </span>
      </div>

      {/* Skill chips: matched are tinted by category, gaps are outlined and dimmed */}
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        <Chip color={MATCH_TIERS[match.tier].color} active className="!text-[10.5px]">
          {WORK_MODE_LABEL[job.workMode]}
        </Chip>
        {topSkills.map((verdict) => {
          const isGap = verdict.coverage <= 0.25
          return (
            <Chip
              key={verdict.id}
              color={isGap ? undefined : skillColor(verdict.id)}
              className={cn('!text-[10.5px]', isGap && 'opacity-55 line-through decoration-1')}
              title={
                isGap
                  ? `Gap: ${verdict.label} not found in your profile`
                  : verdict.kind === 'adjacent'
                    ? `Partial credit via your ${verdict.via} experience`
                    : `Direct match on ${verdict.label}`
              }
            >
              {verdict.kind === 'direct' && !isGap && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
              {verdict.kind === 'adjacent' && !isGap && <Sparkles className="h-2.5 w-2.5" />}
              {verdict.label}
            </Chip>
          )
        })}
      </div>

      {/* Footer: rationale teaser + save toggle */}
      <div className="relative mt-4 flex items-center gap-3 border-t border-[rgb(var(--border)/var(--border-alpha))] pt-3.5">
        <p className="line-clamp-1 flex-1 text-[11.5px] italic text-faint">{match.rationale}</p>
        <button
          type="button"
          aria-label={tracked ? 'Remove from tracker' : 'Save to tracker'}
          onClick={(e) => {
            e.stopPropagation()
            toggleSaved(job.id)
          }}
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200',
            'hover:scale-110 active:scale-90',
            tracked ? 'text-[#22d3ee]' : 'text-faint hover:text-[var(--text)]',
          )}
        >
          {tracked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  )
}
