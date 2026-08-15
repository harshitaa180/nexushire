import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Info, Sparkles, TriangleAlert } from 'lucide-react'
import { RadarChart } from '@/components/charts/Charts'
import { Chip, Meter, SectionLabel } from '@/components/ui/primitives'
import { skillColor, skillLabel } from '@/lib/skills'
import { MATCH_TIERS, type MatchResult } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

/**
 * The explanation panel. Everything here traces back to a number the engine
 * produced — the radar is the six facet scores, the meters are the same values
 * with their weights shown, and the uplift cards are literal re-runs of the
 * model with one extra skill.
 */
export function MatchBreakdown({ match }: { match: MatchResult }) {
  const { explainMode, toggleExplain, addSkill } = useAppStore()
  const tierColor = MATCH_TIERS[match.tier].color

  const axes = match.facets.map((f) => ({
    label: f.label.split(' ')[0],
    value: f.score,
  }))

  return (
    <div className="space-y-7">
      {/* ── Rationale ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-4"
        style={{ background: `${tierColor}12`, border: `1px solid ${tierColor}33` }}
      >
        <div
          aria-hidden
          className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
          style={{ background: tierColor, opacity: 0.25 }}
        />
        <div className="relative flex items-start gap-3">
          <div
            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
            style={{ background: `${tierColor}24`, color: tierColor }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: tierColor }}>
              {MATCH_TIERS[match.tier].label} · {match.score}% match
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted">{match.rationale}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Radar + facet meters ──────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel icon={<Info className="h-3 w-3" />}>Score composition</SectionLabel>
          <button
            type="button"
            onClick={toggleExplain}
            className="text-[11px] font-medium text-faint underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--text)]"
          >
            {explainMode ? 'Hide weights' : 'Show weights'}
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-center">
          <div className="mx-auto">
            <RadarChart axes={axes} size={240} color={tierColor} />
          </div>

          <div className="space-y-3">
            {match.facets.map((facet, i) => (
              <motion.div
                key={facet.key}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-medium">
                    {facet.label}
                    {explainMode && (
                      <span className="ml-1.5 font-mono text-[10px] text-faint">
                        ×{facet.weight.toFixed(2)}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted">
                    {Math.round(facet.score)}
                  </span>
                </div>
                <Meter value={facet.score} color={tierColor} height={5} delay={0.15 + i * 0.06} />
                <p className="mt-1 text-[11.5px] leading-snug text-faint">{facet.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Skill verdicts ────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <SectionLabel icon={<Check className="h-3 w-3" />}>
            Covered · {match.matched.length}
          </SectionLabel>
          <div className="space-y-2">
            {match.matched.length === 0 && (
              <p className="text-[13px] text-faint">No overlapping skills yet.</p>
            )}
            {match.matched.map((verdict, i) => (
              <motion.div
                key={verdict.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2.5"
              >
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px]"
                  style={{
                    background: `${skillColor(verdict.id)}22`,
                    color: skillColor(verdict.id),
                  }}
                >
                  {verdict.kind === 'adjacent' ? (
                    <Sparkles className="h-2.5 w-2.5" />
                  ) : (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  )}
                </span>
                <span className="flex-1 truncate text-[13px]">
                  {verdict.label}
                  {verdict.kind === 'adjacent' && verdict.via && (
                    <span className="ml-1.5 text-[11px] text-faint">via {skillLabel(verdict.via)}</span>
                  )}
                </span>
                <ImportanceDots importance={verdict.importance} />
                <div className="w-14 shrink-0">
                  <Meter
                    value={verdict.coverage * 100}
                    color={skillColor(verdict.id)}
                    height={4}
                    delay={i * 0.04}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel icon={<TriangleAlert className="h-3 w-3" />}>
            Gaps · {match.missing.length}
          </SectionLabel>
          {match.missing.length === 0 ? (
            <p className="text-[13px] text-faint">
              Nothing missing — you cover every listed requirement.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {match.missing.map((verdict) => (
                <Chip
                  key={verdict.id}
                  className="!text-[11px] opacity-80"
                  title={`Importance: ${['nice to have', 'important', 'must have'][verdict.importance - 1]}`}
                >
                  {verdict.label}
                  <ImportanceDots importance={verdict.importance} />
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Counterfactual uplift ─────────────────────────────── */}
      {match.uplifts.length > 0 && (
        <div>
          <SectionLabel icon={<ArrowUpRight className="h-3 w-3" />}>
            Biggest levers — simulated
          </SectionLabel>
          <p className="-mt-1 mb-3 text-[11.5px] text-faint">
            Each figure is the model re-run with that skill added at intermediate proficiency.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {match.uplifts.map((uplift, i) => (
              <motion.button
                key={uplift.skillId}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                onClick={() => addSkill({ id: uplift.skillId, level: 3, years: 1 })}
                className={cn(
                  'group relative overflow-hidden rounded-2xl p-3.5 text-left',
                  'glass transition-all duration-200 hover:-translate-y-0.5 hover:brightness-125',
                )}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-16 opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
                  style={{ background: skillColor(uplift.skillId) }}
                />
                <div className="relative flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold">{uplift.label}</span>
                  <span
                    className="shrink-0 font-mono text-xs font-bold"
                    style={{ color: skillColor(uplift.skillId) }}
                  >
                    +{uplift.delta}
                  </span>
                </div>
                <div className="relative mt-2 flex items-center gap-2 text-[11px] text-faint">
                  <span className="tabular-nums">{match.score}%</span>
                  <div className="h-px flex-1 bg-[rgb(var(--border)/0.3)]" />
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="font-semibold tabular-nums" style={{ color: skillColor(uplift.skillId) }}>
                    {uplift.projected}%
                  </span>
                </div>
                <span className="relative mt-2 block text-[10.5px] text-faint opacity-0 transition-opacity group-hover:opacity-100">
                  Click to add to your profile
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Three dots showing how heavily the posting weights a requirement. */
function ImportanceDots({ importance }: { importance: 1 | 2 | 3 }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5" title={`Importance ${importance} of 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            'h-1 w-1 rounded-full transition-colors',
            n <= importance ? 'bg-current opacity-70' : 'bg-current opacity-20',
          )}
        />
      ))}
    </span>
  )
}
