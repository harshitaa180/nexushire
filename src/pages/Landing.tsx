import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  Gauge,
  KanbanSquare,
  LineChart,
  ScanSearch,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Button, Chip, CompanyMark } from '@/components/ui/primitives'
import { JOBS } from '@/lib/jobs'
import { useMatches } from '@/hooks/useMatches'
import { cn } from '@/lib/utils'

export function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const matches = useMatches()
  const top = [...JOBS]
    .map((job) => ({ job, match: matches.get(job.id)! }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3)

  return (
    <div className="relative">
      {/* ══════════════════ Hero ══════════════════ */}
      <section ref={heroRef} className="relative px-4 pb-24 pt-36 sm:px-6 sm:pt-44">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[12.5px]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34d399]" />
            </span>
            <span className="text-muted">Explainable matching · no black boxes</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.03em]"
          >
            Stop guessing which
            <br />
            jobs are{' '}
            <span className="relative inline-block">
              <span className="text-gradient">worth it</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 8C60 3 140 2 298 6"
                  stroke="url(#underline)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="underline" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c5cff" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mx-auto mt-8 max-w-2xl text-[16.5px] leading-relaxed text-muted"
          >
            NexusHire scores every opening against your real skills across six weighted
            dimensions — then shows you the arithmetic, the gaps, and the single skill that
            would move your match the most.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/jobs">
              <Button size="lg" icon={<Sparkles className="h-4 w-4" />} trailing={<ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />}>
                Explore matched roles
              </Button>
            </Link>
            <Link to="/profile">
              <Button size="lg" variant="subtle" icon={<FileText className="h-4 w-4" />}>
                Import my résumé
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-faint"
          >
            <Stat value={`${JOBS.length}`} label="live roles" />
            <Divider />
            <Stat value="6" label="scoring dimensions" />
            <Divider />
            <Stat value="70+" label="skills in the graph" />
            <Divider />
            <Stat value="0ms" label="server round-trips" />
          </motion.div>
        </motion.div>

        {/* Floating preview cards */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 18 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1200 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            {top.map(({ job, match }, i) => (
              <motion.div
                key={job.id}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                className="glass rounded-3xl p-4"
              >
                <div className="flex items-start gap-3">
                  <CompanyMark name={job.company} initials={job.companyLogo} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[14px] font-semibold">{job.title}</div>
                    <div className="truncate text-[12px] text-faint">{job.company}</div>
                  </div>
                  <ScoreRing score={match.score} size={46} stroke={4} delay={0.8 + i * 0.15} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {match.matched.slice(0, 3).map((v) => (
                    <Chip key={v.id} className="!text-[10px]">
                      {v.label}
                    </Chip>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ How it works ══════════════════ */}
      <Section
        eyebrow="The engine"
        title="Six dimensions, one honest number"
        body="Every match is a weighted sum you can audit. Nothing is hidden behind an embedding you can't inspect."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {FACETS.map((facet, i) => (
            <FeatureCard key={facet.title} {...facet} index={i} />
          ))}
        </div>
      </Section>

      {/* ══════════════════ Differentiators ══════════════════ */}
      <Section
        eyebrow="Why it's different"
        title="It tells you what to do next"
        body="Most job boards rank by keyword overlap and leave you to guess. This one simulates the counterfactual."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <BigCard
            icon={<BrainCircuit className="h-5 w-5" />}
            title="Adjacent-skill credit"
            body="A posting wants Next.js and you only list React? You get 62% credit, not a zero. A weighted skill graph encodes how expertise actually transfers between technologies."
            accent="#7c5cff"
          />
          <BigCard
            icon={<Target className="h-5 w-5" />}
            title="Counterfactual uplift"
            body="For every gap, the engine literally re-runs the whole model with that skill added and reports the delta. “Learn GraphQL → 74% becomes 83%.” Actionable, not decorative."
            accent="#22d3ee"
          />
          <BigCard
            icon={<ScanSearch className="h-5 w-5" />}
            title="Résumé parsing"
            body="Paste your résumé and an n-gram scanner resolves 70+ skills and their aliases — “ES6”, “react.js”, “Core Web Vitals” — into a canonical profile in one pass."
            accent="#34d399"
          />
          <BigCard
            icon={<LineChart className="h-5 w-5" />}
            title="Market-wide gap analysis"
            body="Aggregate across the whole corpus to see which missing skills block the most roles, weighted by how heavily each posting requires them and what those roles pay."
            accent="#fbbf24"
          />
        </div>
      </Section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="px-4 pb-32 pt-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] glass px-8 py-16 text-center"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(70% 100% at 50% 0%, var(--glow-a), transparent 70%), radial-gradient(60% 90% at 90% 100%, var(--glow-b), transparent 70%)',
            }}
          />
          <div className="relative">
            <Gauge className="mx-auto mb-5 h-9 w-9 text-[#22d3ee]" />
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              See your real match scores
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted">
              A profile is already loaded so you can explore immediately. Swap in your own skills
              and every score on the board recalculates instantly.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/jobs">
                <Button size="lg" icon={<Zap className="h-4 w-4" />}>
                  Open the job board
                </Button>
              </Link>
              <Link to="/tracker">
                <Button size="lg" variant="outline" icon={<KanbanSquare className="h-4 w-4" />}>
                  View the tracker
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

/* ───────────────────────────── Pieces ──────────────────────────────── */

const FACETS = [
  {
    icon: <BrainCircuit className="h-5 w-5" />,
    title: 'Skill coverage · 42%',
    body: 'Weighted by how badly the posting wants each skill, softened by proficiency and adjacency.',
    accent: '#7c5cff',
  },
  {
    icon: <Gauge className="h-5 w-5" />,
    title: 'Experience & seniority · 28%',
    body: 'A quadratic penalty below the bar, a gentle taper above it. Over-qualified is a nudge, not a wall.',
    accent: '#22d3ee',
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: 'Location, pay & domain · 30%',
    body: 'Work-mode compatibility, where your floor sits inside the posted band, and TF-IDF similarity on the posting text.',
    accent: '#34d399',
  },
]

function Section({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7c5cff]">
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-[2.5rem]">{title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{body}</p>
        </motion.div>
        {children}
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  body,
  accent,
  index,
}: {
  icon: React.ReactNode
  title: string
  body: string
  accent: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-3xl glass p-6 transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-45"
        style={{ background: accent }}
      />
      <div
        className="relative mb-4 grid h-11 w-11 place-items-center rounded-2xl"
        style={{ background: `${accent}1f`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="relative font-display text-[16px] font-semibold">{title}</h3>
      <p className="relative mt-2 text-[13.5px] leading-relaxed text-muted">{body}</p>
    </motion.div>
  )
}

function BigCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode
  title: string
  body: string
  accent: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55 }}
      className="group relative overflow-hidden rounded-3xl glass p-7"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 opacity-[0.12] blur-3xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </span>
        <h3 className="font-display text-[17px] font-semibold">{title}</h3>
      </div>
      <p className="relative mt-3.5 text-[14px] leading-relaxed text-muted">{body}</p>
    </motion.div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-display text-lg font-bold text-[var(--text)]">{value}</span>
      <span>{label}</span>
    </span>
  )
}

function Divider() {
  return <span className={cn('hidden h-3 w-px bg-[rgb(var(--border)/0.3)] sm:block')} />
}
