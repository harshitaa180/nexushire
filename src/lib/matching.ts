import {
  SENIORITY_ORDER,
  tierFor,
  type FacetKey,
  type Job,
  type MatchResult,
  type Profile,
  type ScoreFacet,
  type SkillVerdict,
  type Uplift,
} from './types'
import { SKILL_BY_ID, normalise, skillLabel, transfer } from './skills'

/**
 * ════════════════════════════════════════════════════════════════
 *  The NexusHire match engine
 * ════════════════════════════════════════════════════════════════
 *
 * A transparent, fully-explainable scoring model. Six weighted facets are
 * computed independently, each returning a 0–100 sub-score plus a sentence
 * of justification, then combined into a single 0–100 match.
 *
 * Design goals, in priority order:
 *   1. Explainable   — every point must be traceable to a stated reason.
 *   2. Forgiving     — adjacent skills earn partial credit (see skills.ts).
 *   3. Actionable    — it tells you which single skill would help most,
 *                      by literally re-running the model with that skill added.
 *
 * Everything runs synchronously in the browser over the job corpus; there is
 * no server round-trip, so the whole list re-scores on every filter keystroke.
 */

export const FACET_WEIGHTS: Record<FacetKey, number> = {
  skills: 0.42,
  experience: 0.16,
  seniority: 0.12,
  location: 0.12,
  compensation: 0.1,
  domain: 0.08,
}

const FACET_LABEL: Record<FacetKey, string> = {
  skills: 'Skill coverage',
  experience: 'Experience depth',
  seniority: 'Seniority alignment',
  location: 'Location & work mode',
  compensation: 'Compensation fit',
  domain: 'Domain affinity',
}

/** Importance 1/2/3 → relative weight inside the skill facet. */
const IMPORTANCE_WEIGHT: Record<1 | 2 | 3, number> = { 1: 1, 2: 2.2, 3: 4 }

/* ─────────────────────────── Facet: skills ─────────────────────────── */

interface SkillFacetResult {
  score: number
  verdicts: SkillVerdict[]
}

function scoreSkills(job: Job, profile: Profile): SkillFacetResult {
  const owned = new Map(profile.skills.map((s) => [s.id, s]))
  const verdicts: SkillVerdict[] = []

  let earned = 0
  let total = 0

  for (const req of job.skills) {
    const weight = IMPORTANCE_WEIGHT[req.importance]
    total += weight

    let best = 0
    let kind: SkillVerdict['kind'] = 'missing'
    let via: string | undefined

    for (const [id, candidateSkill] of owned) {
      const t = transfer(id, req.id)
      if (t === 0) continue

      // Proficiency scales the credit but never zeroes a direct match:
      // a level-1 direct hit still clears 0.6 of the requirement.
      const proficiency = 0.6 + 0.4 * ((candidateSkill.level - 1) / 4)
      const credit = t * proficiency

      if (credit > best) {
        best = credit
        kind = id === req.id ? 'direct' : 'adjacent'
        via = id === req.id ? undefined : id
      }
    }

    best = Math.min(1, best)
    earned += best * weight
    verdicts.push({
      id: req.id,
      label: skillLabel(req.id),
      importance: req.importance,
      coverage: best,
      kind,
      via,
    })
  }

  const score = total === 0 ? 60 : (earned / total) * 100
  return { score: clamp(score), verdicts }
}

/* ──────────────────────── Facet: experience ────────────────────────── */

function scoreExperience(job: Job, profile: Profile): { score: number; detail: string } {
  const gap = profile.yearsExperience - job.minYears

  if (gap >= 0) {
    // Being over-qualified is a mild penalty, not a disqualifier: full marks
    // up to +4 years over, then a gentle taper.
    const over = Math.max(0, gap - 4)
    const score = clamp(100 - over * 5)
    return {
      score,
      detail:
        gap === 0
          ? `You meet the ${job.minYears}-year bar exactly.`
          : `You bring ${fmtYears(gap)} more than the ${job.minYears}-year minimum.`,
    }
  }

  // Under-qualified: each missing year costs progressively more.
  const short = -gap
  const score = clamp(100 - short * short * 9)
  return {
    score,
    detail: `You're ${fmtYears(short)} short of the ${job.minYears}-year requirement.`,
  }
}

/* ───────────────────────── Facet: seniority ────────────────────────── */

function scoreSeniority(job: Job, profile: Profile): { score: number; detail: string } {
  const jobIdx = SENIORITY_ORDER.indexOf(job.seniority)
  const meIdx = SENIORITY_ORDER.indexOf(profile.seniority)
  const diff = meIdx - jobIdx

  if (diff === 0) return { score: 100, detail: 'The level matches your target exactly.' }
  if (diff === 1) return { score: 78, detail: 'One level below your target — likely an easy win.' }
  if (diff === -1) return { score: 74, detail: 'One level above your target — a reachable stretch.' }
  if (diff === 2) return { score: 48, detail: 'Two levels below your target; may feel like a step back.' }
  if (diff === -2) return { score: 40, detail: 'Two levels above your target — an ambitious jump.' }
  return { score: 18, detail: 'The level is far from where you are aiming.' }
}

/* ───────────────────────── Facet: location ─────────────────────────── */

function scoreLocation(job: Job, profile: Profile): { score: number; detail: string } {
  const modeOk = profile.workModes.includes(job.workMode)
  const regionOk = job.region === profile.region

  if (job.workMode === 'remote') {
    if (modeOk) return { score: 100, detail: 'Fully remote and you are open to remote work.' }
    return { score: 55, detail: 'Fully remote, but you prefer to be in an office.' }
  }
  if (modeOk && regionOk) {
    return { score: 96, detail: `${cap(job.workMode)} in ${job.location} — inside your region.` }
  }
  if (modeOk && !regionOk) {
    return { score: 34, detail: `${cap(job.workMode)} in ${job.location} — relocation required.` }
  }
  if (!modeOk && regionOk) {
    return { score: 46, detail: `In your region, but ${job.workMode} does not match your preference.` }
  }
  return { score: 14, detail: 'Neither the work mode nor the location lines up.' }
}

/* ─────────────────────── Facet: compensation ───────────────────────── */

function scoreCompensation(job: Job, profile: Profile): { score: number; detail: string } {
  if (!profile.minSalary) return { score: 70, detail: 'No salary target set — scored neutrally.' }

  if (job.salaryMax >= profile.minSalary) {
    // How deep into the band does their floor sit? Lower is better.
    const band = Math.max(1, job.salaryMax - job.salaryMin)
    const position = (profile.minSalary - job.salaryMin) / band
    const score = clamp(100 - Math.max(0, position) * 26)
    return {
      score,
      detail:
        profile.minSalary <= job.salaryMin
          ? `The whole band (${money(job.salaryMin)}–${money(job.salaryMax)}) clears your target.`
          : `Your target sits in the upper part of the ${money(job.salaryMin)}–${money(job.salaryMax)} band.`,
    }
  }

  const shortfallPct = ((profile.minSalary - job.salaryMax) / profile.minSalary) * 100
  return {
    score: clamp(70 - shortfallPct * 3),
    detail: `Tops out at ${money(job.salaryMax)}, ${Math.round(shortfallPct)}% under your target.`,
  }
}

/* ────────────────────────── Facet: domain ──────────────────────────── */

/**
 * Blend of explicit tag overlap and TF-IDF cosine similarity between the
 * candidate's summary/headline and the job's text. The IDF table is built
 * once over the whole corpus (see `buildCorpus`).
 */
function scoreDomain(
  job: Job,
  profile: Profile,
  idf: Map<string, number>,
  jobVectors: Map<string, Map<string, number>>,
): { score: number; detail: string } {
  const interests = new Set(profile.interests.map(normalise))
  const overlap = job.tags.filter((t) => interests.has(normalise(t)))
  const tagScore = interests.size === 0 ? 55 : clamp((overlap.length / Math.min(2, job.tags.length)) * 100)

  const profileVector = vectorise(`${profile.headline} ${profile.summary}`, idf)
  const jobVector = jobVectors.get(job.id)
  const cosine = jobVector ? cosineSimilarity(profileVector, jobVector) : 0
  const textScore = clamp(cosine * 260) // cosine on short docs is small; rescale

  const score = clamp(tagScore * 0.6 + textScore * 0.4)
  const detail = overlap.length
    ? `Shares your interest in ${overlap.map(cap).join(' and ')}.`
    : cosine > 0.08
      ? 'Your profile text echoes the language of this posting.'
      : 'Outside the domains you listed as interests.'

  return { score, detail }
}

/* ───────────────────────── TF-IDF plumbing ─────────────────────────── */

const STOP_WORDS = new Set(
  `a an the and or but if then than that this these those for to of in on at by with from as is are was were be been being we you they it our your their i me my up out so do does did not no can will would should could have has had about into over under across our`.split(
    /\s+/,
  ),
)

function tokenise(text: string): string[] {
  return normalise(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

export interface Corpus {
  idf: Map<string, number>
  jobVectors: Map<string, Map<string, number>>
}

/** Build the IDF table + per-job TF-IDF vectors once for the whole corpus. */
export function buildCorpus(jobs: Job[]): Corpus {
  const docFreq = new Map<string, number>()
  const docs = new Map<string, string[]>()

  for (const job of jobs) {
    const tokens = tokenise(
      `${job.title} ${job.blurb} ${job.description} ${job.tags.join(' ')} ${job.responsibilities.join(' ')}`,
    )
    docs.set(job.id, tokens)
    for (const term of new Set(tokens)) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1)
    }
  }

  const n = jobs.length || 1
  const idf = new Map<string, number>()
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log((n + 1) / (df + 1)) + 1)
  }

  const jobVectors = new Map<string, Map<string, number>>()
  for (const [id, tokens] of docs) {
    jobVectors.set(id, toTfIdf(tokens, idf))
  }

  return { idf, jobVectors }
}

function vectorise(text: string, idf: Map<string, number>): Map<string, number> {
  return toTfIdf(tokenise(text), idf)
}

function toTfIdf(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)

  const vec = new Map<string, number>()
  for (const [term, count] of tf) {
    vec.set(term, (count / tokens.length) * (idf.get(term) ?? 1))
  }
  return vec
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0
  // Iterate the smaller map for the dot product.
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  for (const [term, weight] of small) {
    const other = large.get(term)
    if (other) dot += weight * other
  }
  const magA = Math.sqrt([...a.values()].reduce((s, v) => s + v * v, 0))
  const magB = Math.sqrt([...b.values()].reduce((s, v) => s + v * v, 0))
  return magA && magB ? dot / (magA * magB) : 0
}

/* ─────────────────────────── Orchestration ─────────────────────────── */

/** Raw weighted score only — used by the uplift simulation's hot loop. */
function rawScore(job: Job, profile: Profile, corpus: Corpus): number {
  const skills = scoreSkills(job, profile)
  const total =
    skills.score * FACET_WEIGHTS.skills +
    scoreExperience(job, profile).score * FACET_WEIGHTS.experience +
    scoreSeniority(job, profile).score * FACET_WEIGHTS.seniority +
    scoreLocation(job, profile).score * FACET_WEIGHTS.location +
    scoreCompensation(job, profile).score * FACET_WEIGHTS.compensation +
    scoreDomain(job, profile, corpus.idf, corpus.jobVectors).score * FACET_WEIGHTS.domain
  return total
}

/**
 * Counterfactual analysis: for each requirement the candidate is weak on,
 * re-run the model with that skill added at level 3 and report the delta.
 * This is what powers the "learn X → +9 pts" callouts.
 */
function computeUplifts(job: Job, profile: Profile, corpus: Corpus, current: number): Uplift[] {
  const weak = job.skills.filter((req) => {
    const owned = profile.skills.find((s) => s.id === req.id)
    return !owned
  })

  const uplifts = weak.map((req) => {
    const hypothetical: Profile = {
      ...profile,
      skills: [...profile.skills, { id: req.id, level: 3, years: 1 }],
    }
    const projected = clamp(rawScore(job, hypothetical, corpus))
    return {
      skillId: req.id,
      label: skillLabel(req.id),
      projected: Math.round(projected),
      delta: Math.round((projected - current) * 10) / 10,
    }
  })

  return uplifts
    .filter((u) => u.delta > 0.4)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)
}

/** Generate a short natural-language rationale from the strongest signals. */
function buildRationale(job: Job, facets: ScoreFacet[], matched: SkillVerdict[], score: number): string {
  const sorted = [...facets].sort((a, b) => b.score - a.score)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  const topSkills = matched
    .filter((v) => v.coverage >= 0.7)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3)
    .map((v) => v.label)

  const opener =
    score >= 88
      ? `You are an exceptional fit for this ${job.title} role.`
      : score >= 74
        ? `This ${job.title} role lines up strongly with your profile.`
        : score >= 58
          ? `A promising match, with a couple of gaps worth closing.`
          : score >= 40
            ? `A stretch role — reachable, but you'd be growing into it.`
            : `A long shot given your current profile.`

  const strength = topSkills.length
    ? ` Your ${listify(topSkills)} experience covers what ${job.company} is asking for most.`
    : ` ${best.label} is your strongest signal here.`

  const weakness =
    worst.score < 62 ? ` The main friction is ${worst.label.toLowerCase()} — ${lower(worst.detail)}` : ''

  return opener + strength + weakness
}

/** Score one job against one profile, with full explanation. */
export function matchJob(job: Job, profile: Profile, corpus: Corpus): MatchResult {
  const skills = scoreSkills(job, profile)
  const experience = scoreExperience(job, profile)
  const seniority = scoreSeniority(job, profile)
  const location = scoreLocation(job, profile)
  const compensation = scoreCompensation(job, profile)
  const domain = scoreDomain(job, profile, corpus.idf, corpus.jobVectors)

  const strong = skills.verdicts.filter((v) => v.coverage >= 0.55).length
  const skillDetail = `${strong} of ${job.skills.length} listed skills covered${
    skills.verdicts.some((v) => v.kind === 'adjacent')
      ? ', including partial credit from adjacent tech.'
      : '.'
  }`

  const facets: ScoreFacet[] = [
    { key: 'skills', label: FACET_LABEL.skills, score: skills.score, weight: FACET_WEIGHTS.skills, detail: skillDetail },
    { key: 'experience', label: FACET_LABEL.experience, score: experience.score, weight: FACET_WEIGHTS.experience, detail: experience.detail },
    { key: 'seniority', label: FACET_LABEL.seniority, score: seniority.score, weight: FACET_WEIGHTS.seniority, detail: seniority.detail },
    { key: 'location', label: FACET_LABEL.location, score: location.score, weight: FACET_WEIGHTS.location, detail: location.detail },
    { key: 'compensation', label: FACET_LABEL.compensation, score: compensation.score, weight: FACET_WEIGHTS.compensation, detail: compensation.detail },
    { key: 'domain', label: FACET_LABEL.domain, score: domain.score, weight: FACET_WEIGHTS.domain, detail: domain.detail },
  ]

  const total = clamp(facets.reduce((sum, f) => sum + f.score * f.weight, 0))
  const score = Math.round(total)

  const matched = skills.verdicts
    .filter((v) => v.coverage > 0.25)
    .sort((a, b) => b.coverage - a.coverage || b.importance - a.importance)
  const missing = skills.verdicts
    .filter((v) => v.coverage <= 0.25)
    .sort((a, b) => b.importance - a.importance || demandOf(b.id) - demandOf(a.id))

  return {
    jobId: job.id,
    score,
    facets,
    matched,
    missing,
    uplifts: computeUplifts(job, profile, corpus, total),
    rationale: buildRationale(job, facets, matched, score),
    tier: tierFor(score),
  }
}

/** Score the whole corpus. Cheap enough to re-run on every render. */
export function matchAll(jobs: Job[], profile: Profile, corpus: Corpus): Map<string, MatchResult> {
  const out = new Map<string, MatchResult>()
  for (const job of jobs) out.set(job.id, matchJob(job, profile, corpus))
  return out
}

/**
 * Corpus-wide skill-gap analysis for the dashboard: which skills appear most
 * often in postings the candidate doesn't already cover, weighted by how
 * important those postings treat them.
 */
export interface SkillGap {
  skillId: string
  label: string
  /** Number of postings requiring it. */
  postings: number
  /** Weighted demand pressure, 0–100 normalised. */
  pressure: number
  /** Mean salary of the postings that ask for it. */
  avgSalary: number
}

export function analyseGaps(jobs: Job[], profile: Profile, limit = 8): SkillGap[] {
  const owned = new Set(profile.skills.map((s) => s.id))
  const acc = new Map<string, { postings: number; weight: number; salary: number }>()

  for (const job of jobs) {
    for (const req of job.skills) {
      if (owned.has(req.id)) continue
      // Skip skills already well covered by adjacency.
      const covered = profile.skills.some((s) => transfer(s.id, req.id) >= 0.6)
      if (covered) continue

      const entry = acc.get(req.id) ?? { postings: 0, weight: 0, salary: 0 }
      entry.postings += 1
      entry.weight += IMPORTANCE_WEIGHT[req.importance]
      entry.salary += (job.salaryMin + job.salaryMax) / 2
      acc.set(req.id, entry)
    }
  }

  const rows = [...acc.entries()].map(([skillId, e]) => ({
    skillId,
    label: skillLabel(skillId),
    postings: e.postings,
    rawPressure: e.weight * (0.5 + demandOf(skillId) / 200),
    avgSalary: Math.round(e.salary / e.postings),
  }))

  const max = Math.max(1, ...rows.map((r) => r.rawPressure))
  return rows
    .map(({ rawPressure, ...r }) => ({ ...r, pressure: Math.round((rawPressure / max) * 100) }))
    .sort((a, b) => b.pressure - a.pressure)
    .slice(0, limit)
}

/* ──────────────────────────── Helpers ──────────────────────────────── */

function demandOf(id: string): number {
  return SKILL_BY_ID.get(id)?.demand ?? 50
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

function fmtYears(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return `${rounded} ${rounded === 1 ? 'year' : 'years'}`
}

function money(n: number): string {
  return `$${Math.round(n / 1000)}k`
}

function listify(items: string[]): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
