import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * A scripted, looping product reel — a screencast assembled from live DOM
 * rather than a recorded file. Four scenes advance on a timer and loop, so the
 * hero has real motion without shipping (or hotlinking) video.
 *
 * `playing` is driven by the parent, which pauses it when it scrolls out of
 * view so it isn't burning frames off-screen.
 */

const SCENES = [
  { id: 'paste', label: 'Import a résumé', duration: 4200 },
  { id: 'extract', label: 'Resolve the skills', duration: 4400 },
  { id: 'score', label: 'Score every role', duration: 5200 },
  { id: 'gaps', label: 'Surface the gaps', duration: 4600 },
] as const

export function DemoReel({ playing = true, className }: { playing?: boolean; className?: string }) {
  const [scene, setScene] = useState(0)

  useEffect(() => {
    if (!playing) return
    const timer = setTimeout(
      () => setScene((s) => (s + 1) % SCENES.length),
      SCENES[scene].duration,
    )
    return () => clearTimeout(timer)
  }, [scene, playing])

  return (
    <div className={cn('relative overflow-hidden rounded-3xl glass', className)}>
      {/* Window chrome — sells the "this is a recording" framing */}
      <div className="flex items-center gap-2 border-b border-[rgb(var(--border)/var(--border-alpha))] px-4 py-2.5">
        <div className="flex gap-1.5">
          {['#b0574a', '#a97a2c', '#2e8b62'].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: `${c}88` }} />
          ))}
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-md border border-[rgb(var(--border)/var(--border-alpha))] px-3 py-0.5 text-[10.5px] text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2e8b62]" />
          nexushire · {SCENES[scene].label}
        </div>
        <span className="text-[10px] tnum text-faint">
          {String(scene + 1).padStart(2, '0')}/{String(SCENES.length).padStart(2, '0')}
        </span>
      </div>

      {/* Stage */}
      <div className="relative h-[300px] overflow-hidden p-5 sm:h-[330px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={SCENES[scene].id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {scene === 0 && <ScenePaste />}
            {scene === 1 && <SceneExtract />}
            {scene === 2 && <SceneScore />}
            {scene === 3 && <SceneGaps />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scene progress bar */}
      <div className="flex gap-1 border-t border-[rgb(var(--border)/var(--border-alpha))] px-4 py-2.5">
        {SCENES.map((s, i) => (
          <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--ring-track)]">
            <motion.div
              className="h-full rounded-full bg-[var(--ink)]"
              initial={{ width: '0%' }}
              animate={{ width: i < scene ? '100%' : i === scene ? '100%' : '0%' }}
              transition={{
                duration: i === scene && playing ? s.duration / 1000 : 0.2,
                ease: 'linear',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════ Scene 1 — paste résumé ════════════════════════ */

const RESUME_LINES = [
  { w: '52%', strong: true },
  { w: '34%' },
  { w: '88%' },
  { w: '76%' },
  { w: '92%' },
  { w: '61%' },
  { w: '80%' },
  { w: '45%' },
]

function ScenePaste() {
  return (
    <div className="relative h-full">
      <div className="eyebrow mb-3 text-faint">résumé.pdf</div>
      <div className="relative h-[210px] overflow-hidden rounded-lg border border-[rgb(var(--border)/var(--border-alpha))] p-4">
        <div className="space-y-2.5">
          {RESUME_LINES.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.09, duration: 0.4 }}
              className="rounded-sm"
              style={{
                width: line.w,
                height: line.strong ? 11 : 7,
                background: line.strong ? 'var(--ink)' : 'var(--ring-track)',
                opacity: line.strong ? 0.85 : 1,
              }}
            />
          ))}
        </div>

        {/* Scanning sweep */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 h-20"
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(45,111,163,0.16), transparent)',
          }}
          initial={{ y: -80 }}
          animate={{ y: 240 }}
          transition={{ duration: 2.2, delay: 0.9, ease: 'easeInOut', repeat: 1 }}
        />
      </div>
    </div>
  )
}

/* ═════════════════════ Scene 2 — skills extracted ══════════════════════ */

const EXTRACTED = [
  { label: 'React', color: '#2b7f8f' },
  { label: 'TypeScript', color: '#3f5f9e' },
  { label: 'CSS', color: '#2b7f8f' },
  { label: 'Next.js', color: '#2b7f8f' },
  { label: 'Node.js', color: '#2e8b62' },
  { label: 'Accessibility', color: '#2b7f8f' },
  { label: 'Testing', color: '#5d6675' },
  { label: 'PostgreSQL', color: '#7f4a72' },
  { label: 'Figma', color: '#b0574a' },
  { label: 'CI/CD', color: '#a97a2c' },
  { label: 'Web Performance', color: '#2b7f8f' },
  { label: 'REST APIs', color: '#2e8b62' },
]

function SceneExtract() {
  return (
    <div className="h-full">
      <div className="eyebrow mb-1 text-faint">n-gram scan complete</div>
      <div className="mb-4 font-display text-[26px] font-semibold">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          12 skills resolved
        </motion.span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EXTRACTED.map((skill, i) => (
          <motion.span
            key={skill.label}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.075, type: 'spring', stiffness: 420, damping: 26 }}
            className="rounded-md border px-2 py-[3px] text-[11.5px] font-medium"
            style={{
              color: skill.color,
              borderColor: `${skill.color}3d`,
              background: `${skill.color}0f`,
            }}
          >
            {skill.label}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════ Scene 3 — roles scored ════════════════════════ */

const SCORED = [
  { title: 'Senior Frontend Engineer', company: 'Lumen Labs', score: 91, color: '#2e8b62' },
  { title: 'Web Developer', company: 'Northwind Studio', score: 84, color: '#2b7f8f' },
  { title: 'Frontend, Growth', company: 'Payload', score: 78, color: '#2b7f8f' },
  { title: 'Full-Stack Engineer', company: 'Cobalt Health', score: 66, color: '#3f5f9e' },
]

function SceneScore() {
  return (
    <div className="h-full">
      <div className="eyebrow mb-3 text-faint">26 roles scored · sorted by match</div>
      <div className="space-y-2">
        {SCORED.map((row, i) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.16, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border)/var(--border-alpha))] px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{row.title}</div>
              <div className="truncate text-[11px] text-faint">{row.company}</div>
            </div>
            <div className="hidden w-28 sm:block">
              <div className="h-1 overflow-hidden rounded-full bg-[var(--ring-track)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: row.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${row.score}%` }}
                  transition={{ delay: 0.35 + i * 0.16, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
            <motion.span
              className="w-10 shrink-0 text-right font-display text-[15px] font-semibold tnum"
              style={{ color: row.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.16 }}
            >
              {row.score}%
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════ Scene 4 — skill gaps ═════════════════════════ */

const GAPS = [
  { label: 'GraphQL', from: 74, to: 83, color: '#2e8b62' },
  { label: 'Design Systems', from: 74, to: 80, color: '#b0574a' },
  { label: 'Docker', from: 74, to: 78, color: '#a97a2c' },
]

function SceneGaps() {
  return (
    <div className="h-full">
      <div className="eyebrow mb-1 text-faint">counterfactual simulation</div>
      <div className="mb-4 text-[13px] text-muted">
        Each figure is the model re-run with that skill added.
      </div>
      <div className="space-y-2.5">
        {GAPS.map((gap, i) => (
          <motion.div
            key={gap.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.22, duration: 0.5 }}
            className="rounded-lg border border-[rgb(var(--border)/var(--border-alpha))] px-3.5 py-3"
          >
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[13px] font-medium">Learn {gap.label}</span>
              <span className="font-mono text-[11.5px] font-semibold" style={{ color: gap.color }}>
                +{gap.to - gap.from}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-faint">
              <span className="tnum">{gap.from}%</span>
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-[var(--ring-track)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-40"
                  style={{ width: `${gap.from}%`, background: gap.color }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: gap.color }}
                  initial={{ width: `${gap.from}%` }}
                  animate={{ width: `${gap.to}%` }}
                  transition={{ delay: 0.6 + i * 0.22, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="font-semibold tnum" style={{ color: gap.color }}>
                {gap.to}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
