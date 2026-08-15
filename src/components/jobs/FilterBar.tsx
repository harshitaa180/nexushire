import { AnimatePresence, motion } from 'framer-motion'
import { ListFilter, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { Button, Chip } from '@/components/ui/primitives'
import { ALL_TAGS } from '@/lib/jobs'
import {
  SENIORITY_LABEL,
  SENIORITY_ORDER,
  WORK_MODE_LABEL,
  type EmploymentType,
  type Seniority,
  type WorkMode,
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAppStore, type SortKey } from '@/store/useAppStore'

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'match', label: 'Best match' },
  { key: 'recent', label: 'Newest' },
  { key: 'salary', label: 'Top pay' },
  { key: 'competition', label: 'Least competition' },
]

const EMPLOYMENT: EmploymentType[] = ['full-time', 'contract', 'part-time', 'internship']

export function FilterBar({ resultCount }: { resultCount: number }) {
  const { filters, setFilters, toggleFilter, clearFilters } = useAppStore()
  const [expanded, setExpanded] = useState(false)

  const activeCount =
    filters.seniority.length +
    filters.workModes.length +
    filters.employmentTypes.length +
    filters.tags.length +
    (filters.minSalary > 0 ? 1 : 0) +
    (filters.minMatch > 0 ? 1 : 0)

  return (
    <div className="glass sticky top-20 z-30 rounded-3xl p-3 sm:p-4">
      {/* Search + sort row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            placeholder="Search roles, companies, skills…"
            className={cn(
              'h-11 w-full rounded-2xl bg-[rgb(var(--surface)/0.1)] pl-10 pr-9 text-sm',
              'border border-[rgb(var(--border)/var(--border-alpha))] outline-none',
              'placeholder:text-faint transition-colors duration-200',
              'focus:border-[rgb(var(--border)/0.35)] focus:bg-[rgb(var(--surface)/0.16)]',
            )}
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => setFilters({ query: '' })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-[var(--text)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-2xl bg-[rgb(var(--surface)/0.1)] p-1">
          {SORTS.map((sort) => (
            <button
              key={sort.key}
              type="button"
              onClick={() => setFilters({ sort: sort.key })}
              className={cn(
                'relative whitespace-nowrap rounded-xl px-3 py-2 text-[12.5px] font-medium transition-colors',
                filters.sort === sort.key ? 'text-white' : 'text-muted hover:text-[var(--text)]',
              )}
            >
              {filters.sort === sort.key && (
                <motion.span
                  layoutId="sort-pill"
                  className="absolute inset-0 rounded-xl bg-[linear-gradient(120deg,#7c5cff,#6d5cff)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{sort.label}</span>
            </button>
          ))}
        </div>

        <Button
          variant={expanded || activeCount ? 'outline' : 'subtle'}
          onClick={() => setExpanded((v) => !v)}
          icon={<SlidersHorizontal className="h-4 w-4" />}
          className="h-11 rounded-2xl"
        >
          Filters
          {activeCount > 0 && (
            <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-[linear-gradient(120deg,#7c5cff,#22d3ee)] px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Result count strip */}
      <div className="mt-2.5 flex items-center gap-2 px-1 text-[11.5px] text-faint">
        <ListFilter className="h-3 w-3" />
        <span>
          <span className="font-semibold text-[var(--text)]">{resultCount}</span> roles scored against
          your profile
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto text-[11.5px] font-medium text-[#7c5cff] transition-opacity hover:opacity-70"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expandable panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-5 border-t border-[rgb(var(--border)/var(--border-alpha))] pt-4 sm:grid-cols-2">
              <FilterGroup label="Seniority">
                {SENIORITY_ORDER.map((level) => (
                  <Chip
                    key={level}
                    active={filters.seniority.includes(level)}
                    onClick={() => toggleFilter('seniority', level as Seniority)}
                  >
                    {SENIORITY_LABEL[level]}
                  </Chip>
                ))}
              </FilterGroup>

              <FilterGroup label="Work mode">
                {(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((mode) => (
                  <Chip
                    key={mode}
                    active={filters.workModes.includes(mode)}
                    onClick={() => toggleFilter('workModes', mode)}
                  >
                    {WORK_MODE_LABEL[mode]}
                  </Chip>
                ))}
              </FilterGroup>

              <FilterGroup label="Employment type">
                {EMPLOYMENT.map((type) => (
                  <Chip
                    key={type}
                    active={filters.employmentTypes.includes(type)}
                    onClick={() => toggleFilter('employmentTypes', type)}
                  >
                    {type}
                  </Chip>
                ))}
              </FilterGroup>

              <FilterGroup label="Domain">
                {ALL_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    active={filters.tags.includes(tag)}
                    onClick={() => toggleFilter('tags', tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </FilterGroup>

              <SliderRow
                label="Minimum salary"
                value={filters.minSalary}
                max={220000}
                step={5000}
                format={(v) => (v === 0 ? 'Any' : `$${Math.round(v / 1000)}k+`)}
                onChange={(minSalary) => setFilters({ minSalary })}
              />

              <SliderRow
                label="Minimum match"
                value={filters.minMatch}
                max={95}
                step={5}
                format={(v) => (v === 0 ? 'Any' : `${v}%+`)}
                onChange={(minMatch) => setFilters({ minMatch })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {label}
        </span>
        <span className="font-mono text-xs text-[#7c5cff]">{format(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full"
      />
    </div>
  )
}
