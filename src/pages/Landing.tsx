import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Layers,
  LineChart,
  Quote,
  ScanSearch,
  Target,
} from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Button, Chip, CompanyMark } from '@/components/ui/primitives'
import {
  AnimatedRule,
  CountUp,
  Marquee,
  Parallax,
  Reveal,
  RevealGroup,
  RevealText,
  Typewriter,
  revealItem,
} from '@/components/ui/motion'
import { MediaBand, WARM_BLOBS } from '@/components/visual/MediaBand'
import { VideoPanel } from '@/components/visual/VideoPanel'
import { FACET_WEIGHTS } from '@/lib/matching'
import { JOBS } from '@/lib/jobs'
import { SKILLS } from '@/lib/skills'
import { useMatches } from '@/hooks/useMatches'

export function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const heroFade = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const matches = useMatches()
  const top = [...JOBS]
    .map((job) => ({ job, match: matches.get(job.id)! }))
    .sort((a, b) => b.match.score - a.match.score)

  const companies = [...new Set(JOBS.map((j) => j.company))]

  return (
    <div className="relative">
      {/* ════════════════════════ Hero ═══════════════════════════ */}
      <section ref={heroRef} className="relative px-4 pb-16 pt-32 sm:px-6 sm:pt-40">
        <motion.div style={{ y: heroY, opacity: heroFade }} className="mx-auto max-w-5xl">
          <Reveal delay={0}>
            <div className="mb-7 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2e8b62]" />
              <span className="eyebrow text-faint">Explainable matching · no black boxes</span>
              <div className="hidden h-px flex-1 bg-[rgb(var(--border)/var(--border-alpha))] sm:block" />
            </div>
          </Reveal>

          <RevealText
            as="h1"
            text="Every role, scored against your actual skills."
            className="max-w-4xl font-display text-[clamp(2.5rem,6.4vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.028em]"
            delay={0.15}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="max-w-xl text-[16px] leading-[1.7] text-muted"
              >
                NexusHire reads your résumé, resolves it against a taxonomy of{' '}
                {SKILLS.length} skills, and scores every opening across six weighted
                dimensions. Then it shows the arithmetic — including the one skill that
                would move your match furthest.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="mt-5 flex items-center gap-2 font-mono text-[13px] text-ink"
              >
                <span className="text-faint">›</span>
                <Typewriter
                  phrases={[
                    'react ≈ next.js  → 0.62 credit',
                    'learn graphql   → 74% becomes 83%',
                    '5 years vs 3 required → 100',
                    'salary floor inside band → 92',
                  ]}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.95 }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Link to="/jobs">
                  <Button
                    size="lg"
                    trailing={
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    }
                  >
                    Explore matched roles
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button size="lg" variant="outline" icon={<FileText className="h-4 w-4" />}>
                    Upload your résumé
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* The reel sits beside the copy rather than below it */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* No `src` passed, so this renders the live reel. Drop an MP4 in
                  public/media/ and pass src="media/showreel.mp4" to use it. */}
              <VideoPanel />
            </motion.div>
          </div>

          {/* Stat rail */}
          <Reveal delay={0.2} className="mt-16">
            <AnimatedRule />
            <div className="grid grid-cols-2 gap-y-7 pt-7 sm:grid-cols-4">
              <RailStat value={JOBS.length} label="live roles" />
              <RailStat value={SKILLS.length} label="skills in the graph" suffix="+" />
              <RailStat value={Object.keys(FACET_WEIGHTS).length} label="scoring dimensions" />
              <RailStat value={0} label="server round-trips" suffix="ms" />
            </div>
          </Reveal>
        </motion.div>
      </section>

      {/* ══════════════════════ Company marquee ══════════════════ */}
      <section className="relative py-10">
        <Reveal>
          <div className="eyebrow mb-5 text-center text-faint">Hiring in the corpus</div>
          <Marquee>
            {companies.map((company) => (
              <div
                key={company}
                className="mx-5 flex shrink-0 items-center gap-2.5 opacity-55 transition-opacity duration-300 hover:opacity-100"
              >
                <CompanyMark
                  name={company}
                  initials={company
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                  size={28}
                />
                <span className="whitespace-nowrap font-display text-[15px] font-medium">
                  {company}
                </span>
              </div>
            ))}
          </Marquee>
        </Reveal>
      </section>

      {/* ═════════════════ Scroll-driven facet ledger ════════════ */}
      <FacetLedger />

      {/* ══════════════════ Full-bleed video band ════════════════ */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <MediaBand blobs={WARM_BLOBS} intensity={1.5} className="px-5 py-12 sm:px-12 sm:py-16">
              <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div>
                  <div className="eyebrow mb-4 text-ink">Watch it run</div>
                  <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.022em]">
                    From a PDF to a ranked shortlist in one pass.
                  </h2>
                  <p className="mt-4 max-w-md text-[14.5px] leading-[1.72] text-muted">
                    Résumé in, skills resolved, twenty-six roles scored, gaps costed. The whole
                    loop runs locally in well under a second — the reel is slowed down so you can
                    actually read it.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {['Parse', 'Resolve', 'Score', 'Simulate'].map((step, i) => (
                      <motion.span
                        key={step}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.1 }}
                        className="rounded-md border border-[rgb(var(--border)/0.3)] bg-[rgb(var(--surface)/0.6)] px-2.5 py-1 text-[11.5px] font-medium"
                      >
                        {String(i + 1).padStart(2, '0')} · {step}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <VideoPanel />
              </div>
            </MediaBand>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════ Differentiators ════════════════════ */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="eyebrow mb-4 text-ink">Why it's different</div>
            <h2 className="max-w-2xl font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.12] tracking-[-0.022em]">
              Most boards rank by keyword overlap and leave you to guess.
            </h2>
            <AnimatedRule className="mt-8" />
          </Reveal>

          <RevealGroup className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2" stagger={0.12}>
            {DIFFERENTIATORS.map((item, i) => (
              <motion.article key={item.title} variants={revealItem} className="group">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="grid h-9 w-9 place-items-center rounded-md border transition-colors duration-300"
                    style={{
                      color: item.accent,
                      borderColor: `${item.accent}33`,
                      background: `${item.accent}0d`,
                    }}
                  >
                    {item.icon}
                  </span>
                  <div className="h-px flex-1 bg-[rgb(var(--border)/var(--border-alpha))] transition-colors duration-300 group-hover:bg-[rgb(var(--border)/0.3)]" />
                </div>
                <h3 className="font-display text-[19px] font-semibold tracking-[-0.015em]">
                  {item.title}
                </h3>
                <p className="mt-2.5 max-w-md text-[14px] leading-[1.72] text-muted">{item.body}</p>
              </motion.article>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ══════════════════ Top matches preview ══════════════════ */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="eyebrow mb-3 text-ink">Live scoring</div>
                <h2 className="font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold tracking-[-0.02em]">
                  Your strongest matches right now
                </h2>
              </div>
              <Link
                to="/jobs"
                className="group flex items-center gap-1.5 text-[13.5px] font-medium text-ink"
              >
                See all {JOBS.length} roles
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <AnimatedRule className="mt-6" />
          </Reveal>

          <RevealGroup className="divide-y divide-[rgb(var(--border)/var(--border-alpha))]" stagger={0.07}>
            {top.slice(0, 5).map(({ job, match }, i) => (
              <motion.div key={job.id} variants={revealItem}>
                <Link
                  to="/jobs"
                  className="group flex items-center gap-4 py-5 transition-colors duration-300 hover:bg-[var(--ink-soft)]"
                >
                  <span className="w-6 shrink-0 pl-1 font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <CompanyMark name={job.company} initials={job.companyLogo} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[16px] font-semibold tracking-[-0.01em]">
                      {job.title}
                    </div>
                    <div className="truncate text-[12.5px] text-muted">
                      {job.company} · {job.location}
                    </div>
                  </div>
                  <div className="hidden max-w-xs flex-1 gap-1.5 md:flex">
                    {match.matched.slice(0, 3).map((v) => (
                      <Chip key={v.id} className="!text-[10.5px]">
                        {v.label}
                      </Chip>
                    ))}
                  </div>
                  <ScoreRing score={match.score} size={52} stroke={2.5} />
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                </Link>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ═══════════════════════ Pull quote ══════════════════════ */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Parallax distance={26}>
            <Reveal>
              <Quote className="mb-6 h-7 w-7 text-ink opacity-30" />
              <blockquote className="font-display text-[clamp(1.4rem,3vw,2.1rem)] font-normal leading-[1.38] tracking-[-0.015em]">
                A score you can't interrogate is just a number someone made up. Every point
                here traces back to a stated reason — which is the only version of this that
                is actually useful when you're deciding where to spend an afternoon applying.
              </blockquote>
              <AnimatedRule className="mt-9" spectrum />
              <p className="mt-4 text-[12.5px] text-faint">Design principle · NexusHire engine</p>
            </Reveal>
          </Parallax>
        </div>
      </section>

      {/* ══════════════════════════ CTA ══════════════════════════ */}
      <section className="px-4 pb-32 pt-6 sm:px-6">
        <Reveal>
          <MediaBand
            intensity={1.6}
            className="mx-auto max-w-5xl px-8 py-16 text-center sm:px-16"
          >
            <div className="relative">
              <div className="eyebrow mb-5 text-ink">Start here</div>
              <h2 className="mx-auto max-w-2xl font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.12] tracking-[-0.022em]">
                Upload a résumé and watch every score recalculate.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-[1.7] text-muted">
                PDF, Word, plain text — parsed entirely in your browser. A sample profile is
                already loaded, so you can look around first.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/profile">
                  <Button size="lg" icon={<FileText className="h-4 w-4" />}>
                    Upload your résumé
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button size="lg" variant="outline">
                    Browse the board
                  </Button>
                </Link>
              </div>
            </div>
          </MediaBand>
        </Reveal>
      </section>
    </div>
  )
}

/* ═══════════════════ Scroll-driven facet ledger ════════════════════════ */

const FACET_ROWS = [
  {
    key: 'skills',
    label: 'Skill coverage',
    detail: 'Weighted by how badly the posting wants each skill, softened by proficiency and adjacency.',
  },
  {
    key: 'experience',
    label: 'Experience depth',
    detail: 'A quadratic penalty below the bar, a gentle taper above it. Over-qualified is a nudge, not a wall.',
  },
  {
    key: 'seniority',
    label: 'Seniority alignment',
    detail: 'Distance along the intern-to-lead ladder, in both directions.',
  },
  {
    key: 'location',
    label: 'Location & work mode',
    detail: 'Remote, hybrid and on-site compatibility, then region proximity.',
  },
  {
    key: 'compensation',
    label: 'Compensation fit',
    detail: 'Where your salary floor sits inside the posted band, not merely whether it clears it.',
  },
  {
    key: 'domain',
    label: 'Domain affinity',
    detail: 'Tag overlap plus TF-IDF cosine similarity between your summary and the posting text.',
  },
] as const

/**
 * The six facets as a ledger, each row's weight bar filling as it enters view.
 * Reads as a table of contents for the engine rather than a feature grid.
 */
function FacetLedger() {
  const maxWeight = Math.max(...Object.values(FACET_WEIGHTS))

  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="eyebrow mb-4 text-ink">The engine</div>
          <h2 className="max-w-2xl font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.12] tracking-[-0.022em]">
            Six dimensions, one number you can audit.
          </h2>
        </Reveal>

        <div className="mt-12">
          <AnimatedRule />
          {FACET_ROWS.map((row, i) => {
            const weight = FACET_WEIGHTS[row.key]
            return (
              <motion.div
                key={row.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.65, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group grid grid-cols-[auto_1fr] gap-x-5 border-b border-[rgb(var(--border)/var(--border-alpha))] py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline"
              >
                <span className="font-mono text-[11px] text-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div>
                  <h3 className="font-display text-[19px] font-semibold tracking-[-0.015em]">
                    {row.label}
                  </h3>
                  <p className="mt-2 max-w-xl text-[14px] leading-[1.7] text-muted">{row.detail}</p>

                  {/* Weight bar, drawn on entry */}
                  <div className="mt-4 flex max-w-xs items-center gap-3">
                    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--ring-track)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--ink)]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(weight / maxWeight) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-faint">weight</span>
                  </div>
                </div>

                <div className="col-span-2 mt-3 font-display text-[30px] font-semibold tnum text-ink sm:col-span-1 sm:mt-0 sm:text-right">
                  <CountUp value={weight * 100} suffix="%" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Pieces ────────────────────────────── */

const DIFFERENTIATORS = [
  {
    icon: <Layers className="h-4 w-4" />,
    title: 'Adjacent skills earn partial credit',
    body: 'A posting wants Next.js and you only list React? You get 0.62 credit, not a zero. A weighted, bidirectional skill graph encodes how expertise actually transfers between technologies — and it is asymmetric, because knowing Next.js implies React more strongly than the reverse.',
    accent: '#3f5f9e',
  },
  {
    icon: <Target className="h-4 w-4" />,
    title: 'Counterfactual uplift, not vague advice',
    body: 'For every gap, the engine re-runs the entire model with that skill added at intermediate proficiency and reports the real delta. "Learn GraphQL and 74% becomes 83%." It is a second pass through the scorer, not a heuristic dressed up as one.',
    accent: '#2e8b62',
  },
  {
    icon: <ScanSearch className="h-4 w-4" />,
    title: 'Résumé parsing that handles real files',
    body: 'Drop in a PDF, a Word document or plain text. An n-gram scanner resolves seventy-plus skills and their aliases — ES6, react.js, Core Web Vitals, k8s — into a canonical profile. Parsing happens in your browser; nothing is uploaded anywhere.',
    accent: '#2b7f8f',
  },
  {
    icon: <LineChart className="h-4 w-4" />,
    title: 'Market-wide gap analysis',
    body: 'Aggregate across the whole corpus to see which missing skills block the most roles, weighted by how heavily each posting requires them and what those roles pay. The answer is usually not the skill you assumed.',
    accent: '#a97a2c',
  },
]

function RailStat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  return (
    <div>
      <div className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold tracking-[-0.02em]">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="mt-1.5 text-[12.5px] text-muted">{label}</div>
    </div>
  )
}
