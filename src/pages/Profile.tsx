import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  FileSearch,
  Loader2,
  Plus,
  RotateCcw,
  ScanLine,
  Sparkles,
  Trash2,
  TriangleAlert,
  UploadCloud,
  UserRound,
  Wand2,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Button, Chip, SectionLabel } from '@/components/ui/primitives'
import { PageBanner, WARM_BLOBS } from '@/components/visual/MediaBand'
import { ALL_TAGS, REGIONS } from '@/lib/jobs'
import {
  ACCEPTED_TYPES,
  ResumeExtractionError,
  extractTextFromFile,
  guessFacts,
  type ResumeFacts,
} from '@/lib/resume'
import { CATEGORY_META, SKILLS, extractSkills, skillColor, skillLabel } from '@/lib/skills'
import {
  SENIORITY_LABEL,
  SENIORITY_ORDER,
  WORK_MODE_LABEL,
  type Seniority,
  type WorkMode,
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const SAMPLE_RESUME = `Priya Raman — Web Developer

Frontend engineer with 4 years building production web applications. Strong in
semantic HTML5, modern CSS (Sass, Tailwind CSS) and vanilla JavaScript (ES6).
Day to day I work in React.js and Next.js with TypeScript, and I care a great
deal about Core Web Vitals and WCAG accessibility.

EXPERIENCE
Frontend Developer, Kite Digital (2022 – present)
- Rebuilt the marketing site in Next.js; cut LCP from 4.1s to 1.3s
- Built a component library with Storybook and design tokens
- Set up GitHub Actions CI running Playwright end-to-end tests

Junior Developer, Bramble Studio (2021 – 2022)
- Shipped responsive, mobile-first client sites with HTML, CSS and jQuery
- Integrated REST APIs and built Node.js/Express endpoints
- Worked in Figma alongside designers on interaction and motion design

SKILLS
JavaScript, TypeScript, React, Next.js, HTML5, CSS3, Tailwind, Redux Toolkit,
Node.js, Express, REST APIs, PostgreSQL, Git, GitHub Actions, Jest, Playwright,
Figma, accessibility (a11y), SEO, Vite, Framer Motion`

export function Profile() {
  const { profile, setProfile, addSkill, removeSkill, updateSkill, resetProfile } = useAppStore()
  const [tab, setTab] = useState<'basics' | 'skills' | 'import'>('basics')

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
      <PageBanner
        eyebrow="Your inputs to the model"
        icon={<UserRound className="h-3 w-3" />}
        title="Profile"
        blobs={WARM_BLOBS}
        body="Everything here feeds the matcher directly. Change a single skill level and every score on the board recalculates — there is no save button because there is no server."
      />

      {/* Tabs */}
      <div className="mb-6 inline-flex gap-1 rounded-2xl glass p-1">
        {(
          [
            ['basics', 'Basics'],
            ['skills', `Skills · ${profile.skills.length}`],
            ['import', 'Import résumé'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'relative rounded-xl px-4 py-2 text-[13px] font-medium transition-colors',
              tab === key ? 'text-white' : 'text-muted hover:text-[var(--text)]',
            )}
          >
            {tab === key && (
              <motion.span
                layoutId="profile-tab"
                className="absolute inset-0 rounded-xl bg-[linear-gradient(120deg,#6d4aff,#5b3df0)]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'basics' && (
            <BasicsPanel profile={profile} setProfile={setProfile} onReset={resetProfile} />
          )}
          {tab === 'skills' && (
            <SkillsPanel
              skills={profile.skills}
              onAdd={addSkill}
              onRemove={removeSkill}
              onUpdate={updateSkill}
            />
          )}
          {tab === 'import' && <ImportPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ═════════════════════════════ Basics ══════════════════════════════════ */

function BasicsPanel({
  profile,
  setProfile,
  onReset,
}: {
  profile: ReturnType<typeof useAppStore.getState>['profile']
  setProfile: ReturnType<typeof useAppStore.getState>['setProfile']
  onReset: () => void
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Identity">
        <Field label="Name">
          <TextInput value={profile.name} onChange={(name) => setProfile({ name })} />
        </Field>
        <Field label="Headline">
          <TextInput
            value={profile.headline}
            onChange={(headline) => setProfile({ headline })}
            placeholder="e.g. Web Developer"
          />
        </Field>
        <Field
          label="Summary"
          hint="Compared against each posting with TF-IDF cosine similarity."
        >
          <textarea
            value={profile.summary}
            onChange={(e) => setProfile({ summary: e.target.value })}
            rows={5}
            className={inputClass}
          />
        </Field>
      </Panel>

      <div className="space-y-4">
        <Panel title="Experience">
          <Field label={`Years of experience · ${profile.yearsExperience}`}>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={profile.yearsExperience}
              onChange={(e) => setProfile({ yearsExperience: Number(e.target.value) })}
              className="w-full"
              aria-label="Years of experience"
            />
          </Field>
          <Field label="Target level">
            <div className="flex flex-wrap gap-1.5">
              {SENIORITY_ORDER.map((level) => (
                <Chip
                  key={level}
                  active={profile.seniority === level}
                  onClick={() => setProfile({ seniority: level as Seniority })}
                >
                  {SENIORITY_LABEL[level]}
                </Chip>
              ))}
            </div>
          </Field>
        </Panel>

        <Panel title="Preferences">
          <Field label="Open to">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((mode) => (
                <Chip
                  key={mode}
                  active={profile.workModes.includes(mode)}
                  onClick={() =>
                    setProfile({
                      workModes: profile.workModes.includes(mode)
                        ? profile.workModes.filter((m) => m !== mode)
                        : [...profile.workModes, mode],
                    })
                  }
                >
                  {WORK_MODE_LABEL[mode]}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Region">
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map((region) => (
                <Chip
                  key={region}
                  active={profile.region === region}
                  onClick={() => setProfile({ region })}
                >
                  {region}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label={`Salary floor · $${Math.round(profile.minSalary / 1000)}k`}>
            <input
              type="range"
              min={0}
              max={250000}
              step={5000}
              value={profile.minSalary}
              onChange={(e) => setProfile({ minSalary: Number(e.target.value) })}
              className="w-full"
              aria-label="Minimum salary"
            />
          </Field>
          <Field label="Domain interests">
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  active={profile.interests.includes(tag)}
                  onClick={() =>
                    setProfile({
                      interests: profile.interests.includes(tag)
                        ? profile.interests.filter((t) => t !== tag)
                        : [...profile.interests, tag],
                    })
                  }
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </Field>
        </Panel>

        <Button variant="danger" onClick={onReset} icon={<RotateCcw className="h-4 w-4" />}>
          Reset to the demo profile
        </Button>
      </div>
    </div>
  )
}

/* ═════════════════════════════ Skills ══════════════════════════════════ */

function SkillsPanel({
  skills,
  onAdd,
  onRemove,
  onUpdate,
}: {
  skills: ReturnType<typeof useAppStore.getState>['profile']['skills']
  onAdd: ReturnType<typeof useAppStore.getState>['addSkill']
  onRemove: (id: string) => void
  onUpdate: ReturnType<typeof useAppStore.getState>['updateSkill']
}) {
  const [search, setSearch] = useState('')
  const owned = new Set(skills.map((s) => s.id))

  const available = useMemo(() => {
    const q = search.toLowerCase().trim()
    return SKILLS.filter(
      (s) =>
        !owned.has(s.id) &&
        (!q || s.label.toLowerCase().includes(q) || s.aliases.some((a) => a.includes(q))),
    ).slice(0, 24)
  }, [search, skills.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Panel title={`Your skills · ${skills.length}`}>
        {skills.length === 0 && (
          <p className="text-sm text-faint">No skills yet — add some from the panel on the right.</p>
        )}
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {skills.map((skill) => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                className="group flex items-center gap-3 rounded-2xl bg-[rgb(var(--surface)/0.08)] px-3.5 py-2.5"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: skillColor(skill.id),
                    boxShadow: `0 0 8px ${skillColor(skill.id)}`,
                  }}
                />
                <span className="w-36 shrink-0 truncate text-[13.5px] font-medium">
                  {skillLabel(skill.id)}
                </span>

                {/* Proficiency dots */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      aria-label={`Set ${skillLabel(skill.id)} to level ${level}`}
                      onClick={() => onUpdate(skill.id, { level })}
                      className="group/dot p-0.5"
                    >
                      <span
                        className={cn(
                          'block h-2.5 w-2.5 rounded-full transition-all duration-150',
                          'group-hover/dot:scale-125',
                        )}
                        style={{
                          background:
                            level <= skill.level ? skillColor(skill.id) : 'var(--ring-track)',
                          boxShadow: level <= skill.level ? `0 0 6px ${skillColor(skill.id)}80` : 'none',
                        }}
                      />
                    </button>
                  ))}
                </div>

                <span className="ml-auto shrink-0 font-mono text-[11px] text-faint">
                  L{skill.level}
                </span>

                <button
                  type="button"
                  onClick={() => onRemove(skill.id)}
                  aria-label={`Remove ${skillLabel(skill.id)}`}
                  className="shrink-0 text-faint opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Panel>

      <Panel title="Add a skill">
        <TextInput value={search} onChange={setSearch} placeholder="Search 70+ skills…" />
        <div className="mt-3 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {Object.entries(CATEGORY_META).map(([category, meta]) => {
            const group = available.filter((s) => s.category === category)
            if (!group.length) return null
            return (
              <div key={category}>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((skill) => (
                    <Chip
                      key={skill.id}
                      color={meta.color}
                      onClick={() => onAdd({ id: skill.id, level: 3, years: 1 })}
                    >
                      <Plus className="h-2.5 w-2.5" strokeWidth={3} />
                      {skill.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )
          })}
          {available.length === 0 && (
            <p className="text-[13px] text-faint">
              Nothing left to add here — try a different search term.
            </p>
          )}
        </div>
      </Panel>
    </div>
  )
}

/* ═════════════════════════════ Import ══════════════════════════════════ */

type ScanState =
  | { phase: 'idle' }
  | { phase: 'reading'; stage: string; fileName: string }
  | { phase: 'scanning' }
  | { phase: 'error'; message: string; hint?: string }
  | {
      phase: 'done'
      found: string[]
      added: number
      source: string
      warnings: string[]
      facts: ResumeFacts
    }

function ImportPanel() {
  const mergeSkills = useAppStore((st) => st.mergeSkills)
  const setProfile = useAppStore((st) => st.setProfile)
  const [text, setText] = useState('')
  const [state, setState] = useState<ScanState>({ phase: 'idle' })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Drag events fire per-child, so track depth rather than toggling a boolean.
  const dragDepth = useRef(0)

  /** Runs the taxonomy scan over whatever text we ended up with. */
  const scanText = (source: string, label: string, warnings: string[] = []) => {
    if (!source.trim()) {
      setState({
        phase: 'error',
        message: 'No readable text was found.',
        hint: 'Try a different file, or paste the text directly.',
      })
      return
    }

    setState({ phase: 'scanning' })

    // A short deliberate delay so the scan animation is legible — the parse
    // itself is synchronous and takes well under a millisecond.
    window.setTimeout(() => {
      const found = extractSkills(source)
      const added = mergeSkills(found)

      // Only fill fields the parser is confident about, and never clobber a
      // value the user has already customised away from the default.
      const facts = guessFacts(source)
      const patch: Parameters<typeof setProfile>[0] = {}
      if (facts.name) patch.name = facts.name
      if (facts.headline) patch.headline = facts.headline
      if (facts.yearsExperience) patch.yearsExperience = facts.yearsExperience
      if (Object.keys(patch).length) setProfile(patch)

      setState({ phase: 'done', found, added, source: label, warnings, facts })
    }, 900)
  }

  const handleFile = async (file: File) => {
    setState({ phase: 'reading', stage: 'Opening the file', fileName: file.name })
    try {
      const result = await extractTextFromFile(file, (stage) =>
        setState({ phase: 'reading', stage, fileName: file.name }),
      )
      setText(result.text)
      const label = `${file.name}${result.pages ? ` · ${result.pages} pages` : ''}`
      scanText(result.text, label, result.warnings)
    } catch (error) {
      if (error instanceof ResumeExtractionError) {
        setState({ phase: 'error', message: error.message, hint: error.hint })
      } else {
        setState({
          phase: 'error',
          message: 'Something went wrong reading that file.',
          hint: (error as Error).message,
        })
      }
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Upload or paste">
        {/* ── Drop zone ─────────────────────────────────────── */}
        <div
          onDragEnter={(e) => {
            e.preventDefault()
            dragDepth.current += 1
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            dragDepth.current -= 1
            if (dragDepth.current <= 0) setDragging(false)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload a résumé file"
          className={cn(
            'relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-7 text-center',
            'transition-all duration-300',
            dragging
              ? 'scale-[1.01] border-[var(--ink)] bg-[var(--ink-soft)]'
              : 'border-[rgb(var(--border)/0.28)] hover:border-[rgb(var(--border)/0.5)] hover:bg-[var(--ink-soft)]',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              // Reset so picking the same file twice still fires a change.
              e.target.value = ''
            }}
          />

          <motion.div
            animate={dragging ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[linear-gradient(140deg,#6d4aff22,#06b6d422)] text-ink"
          >
            <UploadCloud className="h-5 w-5" />
          </motion.div>

          <div className="text-[14px] font-medium">
            {dragging ? 'Drop it here' : 'Drop your résumé, or click to browse'}
          </div>
          <div className="mt-1.5 text-[12px] text-faint">
            PDF, Word (.docx), plain text, Markdown, RTF or HTML · up to 20MB
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {['PDF', 'DOCX', 'TXT', 'MD', 'RTF', 'HTML'].map((format) => (
              <span
                key={format}
                className="rounded border border-[rgb(var(--border)/var(--border-alpha))] px-1.5 py-0.5 font-mono text-[9.5px] text-faint"
              >
                {format}
              </span>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-faint">
            Parsed entirely in your browser — the file is never uploaded.
          </p>
        </div>

        {/* ── Paste alternative ─────────────────────────────── */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[rgb(var(--border)/var(--border-alpha))]" />
          <span className="text-[11px] text-faint">or paste the text</span>
          <div className="h-px flex-1 bg-[rgb(var(--border)/var(--border-alpha))]" />
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            placeholder="Paste résumé text here…"
            className={cn(inputClass, 'font-mono text-[12px] leading-relaxed')}
          />
          {state.phase === 'scanning' && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className="absolute inset-x-0 h-24 animate-scan"
                style={{
                  background: 'linear-gradient(180deg, transparent, rgba(109,74,255,0.22), transparent)',
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            onClick={() => scanText(text, 'pasted text')}
            disabled={!text.trim() || state.phase === 'scanning' || state.phase === 'reading'}
            icon={
              state.phase === 'scanning' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )
            }
          >
            {state.phase === 'scanning' ? 'Scanning…' : 'Extract skills'}
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              setText(SAMPLE_RESUME)
              setState({ phase: 'idle' })
            }}
            icon={<Wand2 className="h-4 w-4" />}
          >
            Load a sample
          </Button>
          {text && (
            <Button
              variant="ghost"
              onClick={() => {
                setText('')
                setState({ phase: 'idle' })
              }}
              icon={<X className="h-4 w-4" />}
            >
              Clear
            </Button>
          )}
        </div>
      </Panel>

      <Panel title="Extraction result">
        <AnimatePresence mode="wait">
          {state.phase === 'idle' && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[13.5px] leading-relaxed text-faint"
            >
              Drop a file above, or paste text and hit{' '}
              <span className="text-[var(--text)]">Extract skills</span>. Any skill the parser
              recognises and you don't already have is added at level 3.
            </motion.p>
          )}

          {state.phase === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[rgb(var(--border)/var(--border-alpha))] px-3.5 py-3">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium">{state.fileName}</div>
                  <div className="truncate text-[11.5px] text-faint">{state.stage}…</div>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[var(--ring-track)]">
                <motion.div
                  className="h-full w-1/3 rounded-full bg-[linear-gradient(90deg,#6d4aff,#06b6d4)]"
                  animate={{ x: ['-100%', '320%'] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}

          {state.phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-[#f43f5e40] bg-[#f43f5e0f] p-4"
            >
              <div className="flex items-start gap-2.5">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#f43f5e]" />
                <div>
                  <div className="text-[13.5px] font-medium">{state.message}</div>
                  {state.hint && (
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{state.hint}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {state.phase === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="h-7 rounded-xl bg-[rgb(var(--surface)/0.12)]"
                  animate={{ opacity: [0.3, 0.75, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </motion.div>
          )}

          {state.phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 rounded-2xl border border-[#10b98140] bg-[#10b9810f] px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#10b98122] text-[#10b981]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <div className="min-w-0 text-[13px]">
                    <span className="font-semibold">{state.found.length} skills recognised</span>
                    <span className="text-faint">
                      {' · '}
                      {state.added} newly added
                    </span>
                    <div className="truncate text-[11.5px] text-faint">from {state.source}</div>
                  </div>
                </div>
              </div>

              {/* Fields the parser was confident enough to fill in */}
              {(state.facts.name || state.facts.headline || state.facts.yearsExperience) && (
                <div className="mb-4">
                  <SectionLabel icon={<FileSearch className="h-3 w-3" />}>
                    Also detected
                  </SectionLabel>
                  <div className="space-y-1.5 text-[12.5px]">
                    {state.facts.name && <DetectedRow label="Name" value={state.facts.name} />}
                    {state.facts.headline && (
                      <DetectedRow label="Headline" value={state.facts.headline} />
                    )}
                    {state.facts.yearsExperience && (
                      <DetectedRow
                        label="Experience"
                        value={`${state.facts.yearsExperience} years`}
                      />
                    )}
                  </div>
                </div>
              )}

              {state.warnings.map((warning) => (
                <div
                  key={warning}
                  className="mb-3 flex items-start gap-2 rounded-xl border border-[#f59e0b40] bg-[#f59e0b0f] px-3 py-2.5 text-[12px] leading-relaxed text-muted"
                >
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f59e0b]" />
                  {warning}
                </div>
              ))}

              <SectionLabel icon={<Sparkles className="h-3 w-3" />}>Recognised</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {state.found.map((id, i) => (
                  <motion.span
                    key={id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.025 }}
                  >
                    <Chip color={skillColor(id)}>{skillLabel(id)}</Chip>
                  </motion.span>
                ))}
              </div>
              {state.found.length === 0 && (
                <p className="text-[13px] text-faint">
                  Nothing recognised — the taxonomy covers web, backend, data, infra and design
                  skills.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>
    </div>
  )
}

/* ═════════════════════════════ Shared ══════════════════════════════════ */

const inputClass = cn(
  'w-full resize-none rounded-2xl bg-[rgb(var(--surface)/0.1)] px-3.5 py-2.5 text-[13.5px]',
  'border border-[rgb(var(--border)/var(--border-alpha))] outline-none',
  'placeholder:text-faint transition-colors duration-200',
  'focus:border-[rgb(var(--border)/0.35)] focus:bg-[rgb(var(--surface)/0.16)]',
)

/** One "we also detected this" row in the extraction result panel. */
function DetectedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-20 shrink-0 text-faint">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl glass p-5">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="mb-1.5 block text-[12.5px] font-medium">{label}</label>
      {hint && <p className="mb-2 text-[11.5px] text-faint">{hint}</p>}
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(inputClass, 'h-10 py-0')}
    />
  )
}
