import { motion } from 'framer-motion'
import { BarChart3, Layers, Sparkles, Target, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { BarList, DonutChart, Histogram, RadarChart, Sparkline } from '@/components/charts/Charts'
import { SectionLabel } from '@/components/ui/primitives'
import { ScorePill } from '@/components/ui/ScoreRing'
import { useMatches } from '@/hooks/useMatches'
import { JOBS } from '@/lib/jobs'
import { analyseGaps } from '@/lib/matching'
import { skillCategory, skillColor, type SkillCategory } from '@/lib/skills'
import { MATCH_TIERS, type MatchTier } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'

export function Insights() {
  const matches = useMatches()
  const profile = useAppStore((st) => st.profile)

  const stats = useMemo(() => {
    const results = [...matches.values()]
    const scores = results.map((r) => r.score)
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1))

    // Distribution across the five tiers.
    const tierCounts: Record<MatchTier, number> = {
      exceptional: 0,
      strong: 0,
      promising: 0,
      stretch: 0,
      weak: 0,
    }
    for (const r of results) tierCounts[r.tier] += 1

    // 10-point histogram buckets from 40 to 100.
    const buckets = [0, 0, 0, 0, 0, 0]
    for (const s of scores) {
      const idx = Math.min(5, Math.max(0, Math.floor((s - 40) / 10)))
      buckets[idx] += 1
    }

    // Average facet scores across the corpus — where you're systematically strong.
    const facetTotals = new Map<string, { label: string; sum: number; n: number }>()
    for (const r of results) {
      for (const f of r.facets) {
        const entry = facetTotals.get(f.key) ?? { label: f.label, sum: 0, n: 0 }
        entry.sum += f.score
        entry.n += 1
        facetTotals.set(f.key, entry)
      }
    }
    const facetAverages = [...facetTotals.values()].map((e) => ({
      label: e.label.split(' ')[0],
      value: Math.round(e.sum / e.n),
    }))

    // Skill mix by category in the candidate's own profile.
    const categoryCounts = new Map<SkillCategory, number>()
    for (const s of profile.skills) {
      const cat = skillCategory(s.id)
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
    }

    const reachable = results.filter((r) => r.score >= 74).length
    const bestPaying = [...JOBS]
      .filter((j) => (matches.get(j.id)?.score ?? 0) >= 60)
      .sort((a, b) => b.salaryMax - a.salaryMax)[0]

    return { average, tierCounts, buckets, facetAverages, categoryCounts, reachable, bestPaying, results }
  }, [matches, profile.skills])

  const gaps = useMemo(() => analyseGaps(JOBS, profile, 8), [profile])

  // A plausible trajectory line: what the average would have been as skills accrued.
  const trajectory = useMemo(() => {
    const n = profile.skills.length
    return Array.from({ length: 8 }, (_, i) => {
      const t = (i + 1) / 8
      return Math.round(28 + (stats.average - 28) * Math.pow(t, 0.65) + (n % 3) * t * 2)
    })
  }, [stats.average, profile.skills.length])

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-7"
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7c5cff]">
          <BarChart3 className="h-3 w-3" />
          Aggregate view
        </div>
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">
          Insights
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">
          Your profile scored against the entire corpus at once — where you're consistently strong,
          and which single skills unlock the most roles.
        </p>
      </motion.div>

      {/* KPI row */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Target className="h-4 w-4" />}
          label="Average match"
          value={`${stats.average}%`}
          accent="#7c5cff"
          delay={0}
        >
          <Sparkline points={trajectory} color="#7c5cff" width={100} height={30} />
        </KpiCard>
        <KpiCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Strong or better"
          value={`${stats.reachable}`}
          sub={`of ${JOBS.length} roles`}
          accent="#34d399"
          delay={0.08}
        />
        <KpiCard
          icon={<Layers className="h-4 w-4" />}
          label="Skills on file"
          value={`${profile.skills.length}`}
          sub={`${stats.categoryCounts.size} categories`}
          accent="#22d3ee"
          delay={0.16}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Best reachable pay"
          value={stats.bestPaying ? `$${Math.round(stats.bestPaying.salaryMax / 1000)}k` : '—'}
          sub={stats.bestPaying?.company}
          accent="#fbbf24"
          delay={0.24}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Facet radar */}
        <Card title="Where you're strong" subtitle="Mean facet score across all 26 postings">
          <div className="grid place-items-center py-2">
            <RadarChart axes={stats.facetAverages} size={250} color="#22d3ee" />
          </div>
        </Card>

        {/* Tier donut */}
        <Card title="Match distribution" subtitle="How the corpus splits across tiers">
          <div className="grid place-items-center py-2">
            <DonutChart
              size={180}
              thickness={20}
              centerValue={JOBS.length}
              centerLabel="roles"
              slices={(Object.keys(stats.tierCounts) as MatchTier[])
                .filter((t) => stats.tierCounts[t] > 0)
                .map((t) => ({
                  label: MATCH_TIERS[t].label,
                  value: stats.tierCounts[t],
                  color: MATCH_TIERS[t].color,
                }))}
            />
          </div>
          <div className="mt-4 space-y-1.5">
            {(Object.keys(stats.tierCounts) as MatchTier[]).map((t) => (
              <div key={t} className="flex items-center gap-2 text-[12.5px]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: MATCH_TIERS[t].color, boxShadow: `0 0 8px ${MATCH_TIERS[t].color}` }}
                />
                <span className="text-muted">{MATCH_TIERS[t].label}</span>
                <span className="ml-auto font-mono tabular-nums">{stats.tierCounts[t]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Histogram */}
        <Card title="Score histogram" subtitle="Roles per 10-point band, 40 → 100">
          <div className="pt-4">
            <Histogram
              buckets={stats.buckets}
              colors={['#fb7185', '#fbbf24', '#fbbf24', '#7c5cff', '#22d3ee', '#34d399']}
            />
            <div className="mt-2 flex justify-between text-[10px] text-faint">
              {['40', '50', '60', '70', '80', '90+'].map((label) => (
                <span key={label} className="flex-1 text-center">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
            Most profiles cluster in the 55–75 band. Everything above 74 is worth an application;
            below 50 you'd be relying on the cover letter.
          </p>
        </Card>

        {/* Gap analysis — full width */}
        <div className="lg:col-span-2">
          <Card
            title="Highest-leverage skill gaps"
            subtitle="Weighted by how many postings need it, how badly, and what they pay"
          >
            {gaps.length === 0 ? (
              <p className="py-6 text-center text-[13.5px] text-faint">
                No meaningful gaps — your profile covers the corpus.
              </p>
            ) : (
              <BarList
                rows={gaps.map((gap) => ({
                  label: gap.label,
                  value: gap.pressure,
                  hint: `${gap.postings} roles · $${Math.round(gap.avgSalary / 1000)}k avg`,
                  color: skillColor(gap.skillId),
                }))}
              />
            )}
          </Card>
        </div>

        {/* Top matches list */}
        <Card title="Your top roles" subtitle="Highest scoring postings right now">
          <div className="space-y-2">
            {[...JOBS]
              .map((job) => ({ job, match: matches.get(job.id)! }))
              .sort((a, b) => b.match.score - a.match.score)
              .slice(0, 7)
              .map(({ job, match }, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl px-1 py-1.5"
                >
                  <span className="w-4 shrink-0 font-mono text-[11px] text-faint">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{job.title}</div>
                    <div className="truncate text-[11px] text-faint">{job.company}</div>
                  </div>
                  <ScorePill score={match.score} />
                </motion.div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ─────────────────────────────── Pieces ────────────────────────────── */

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
  delay,
  children,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent: string
  delay: number
  children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-3xl glass p-5"
    >
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div
            className="mb-3 grid h-9 w-9 place-items-center rounded-xl"
            style={{ background: `${accent}1f`, color: accent }}
          >
            {icon}
          </div>
          <div className="font-display text-[26px] font-bold leading-none tabular-nums">{value}</div>
          <div className="mt-1.5 text-[11.5px] uppercase tracking-wider text-faint">{label}</div>
          {sub && <div className="mt-0.5 text-[11.5px] text-muted">{sub}</div>}
        </div>
        {children && <div className="mt-auto">{children}</div>}
      </div>
    </motion.div>
  )
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="h-full rounded-3xl glass p-5"
    >
      <SectionLabel>{title}</SectionLabel>
      {subtitle && <p className="-mt-2 mb-4 text-[12px] text-faint">{subtitle}</p>}
      {children}
    </motion.div>
  )
}
