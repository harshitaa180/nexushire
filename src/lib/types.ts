export type Seniority = 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'lead'

export const SENIORITY_ORDER: Seniority[] = ['intern', 'junior', 'mid', 'senior', 'staff', 'lead']

export const SENIORITY_LABEL: Record<Seniority, string> = {
  intern: 'Intern',
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  staff: 'Staff',
  lead: 'Lead / Principal',
}

export type WorkMode = 'remote' | 'hybrid' | 'onsite'

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
}

export type EmploymentType = 'full-time' | 'contract' | 'part-time' | 'internship'

/** A single skill requirement on a job posting. */
export interface SkillRequirement {
  /** Canonical skill id — see `SKILL_TAXONOMY`. */
  id: string
  /** 1 = nice-to-have, 2 = important, 3 = must-have. Drives the weighted coverage score. */
  importance: 1 | 2 | 3
}

export interface Job {
  id: string
  title: string
  company: string
  companyLogo: string
  /** Short tagline shown on the card. */
  blurb: string
  description: string
  responsibilities: string[]
  perks: string[]
  skills: SkillRequirement[]
  seniority: Seniority
  minYears: number
  workMode: WorkMode
  location: string
  /** Continent-ish region used for location proximity scoring. */
  region: string
  employmentType: EmploymentType
  salaryMin: number
  salaryMax: number
  currency: string
  /** Domain tags — fintech, devtools, etc. Matched against candidate interests. */
  tags: string[]
  teamSize: number
  postedDaysAgo: number
  applicants: number
  featured?: boolean
}

export interface CandidateSkill {
  id: string
  /** 1–5 self-rated proficiency. */
  level: number
  years: number
}

export interface Profile {
  name: string
  headline: string
  /** Free-text summary — fed into the TF-IDF semantic similarity component. */
  summary: string
  skills: CandidateSkill[]
  yearsExperience: number
  seniority: Seniority
  workModes: WorkMode[]
  region: string
  minSalary: number
  interests: string[]
  /** Set once the user has done enough for matching to be meaningful. */
  onboarded: boolean
}

/** One weighted axis of the overall match score. */
export interface ScoreFacet {
  key: FacetKey
  label: string
  /** 0–100 */
  score: number
  /** Contribution weight, sums to 1 across facets. */
  weight: number
  /** Human-readable justification rendered in the breakdown panel. */
  detail: string
}

export type FacetKey = 'skills' | 'experience' | 'seniority' | 'location' | 'compensation' | 'domain'

export interface SkillVerdict {
  id: string
  label: string
  importance: 1 | 2 | 3
  /** 0–1 — how well the candidate covers this requirement. */
  coverage: number
  /** 'direct' = has the skill, 'adjacent' = credited via a related skill, 'missing' = no signal. */
  kind: 'direct' | 'adjacent' | 'missing'
  /** For adjacent matches, the skill that earned the partial credit. */
  via?: string
}

/** A "what if I learned X" simulation result. */
export interface Uplift {
  skillId: string
  label: string
  /** Overall score if this skill were added at level 3. */
  projected: number
  /** projected - current */
  delta: number
}

export interface MatchResult {
  jobId: string
  /** 0–100 overall. */
  score: number
  facets: ScoreFacet[]
  matched: SkillVerdict[]
  missing: SkillVerdict[]
  uplifts: Uplift[]
  /** Generated natural-language rationale. */
  rationale: string
  tier: MatchTier
}

export type MatchTier = 'exceptional' | 'strong' | 'promising' | 'stretch' | 'weak'

export interface TierMeta {
  label: string
  /** Tailwind-ready hex used for rings, glows and chips. */
  color: string
  min: number
}

/**
 * A saturated spectrum ramp — green through cyan, violet, amber, rose. Each
 * value stays readable on both the light and dark grounds, and the ordering
 * means a glance at the colour alone tells you roughly where a role sits.
 */
export const MATCH_TIERS: Record<MatchTier, TierMeta> = {
  exceptional: { label: 'Exceptional fit', color: '#10b981', min: 88 },
  strong: { label: 'Strong fit', color: '#06b6d4', min: 74 },
  promising: { label: 'Promising', color: '#6d4aff', min: 58 },
  stretch: { label: 'Stretch role', color: '#f59e0b', min: 40 },
  weak: { label: 'Long shot', color: '#f43f5e', min: 0 },
}

export function tierFor(score: number): MatchTier {
  if (score >= MATCH_TIERS.exceptional.min) return 'exceptional'
  if (score >= MATCH_TIERS.strong.min) return 'strong'
  if (score >= MATCH_TIERS.promising.min) return 'promising'
  if (score >= MATCH_TIERS.stretch.min) return 'stretch'
  return 'weak'
}

export type ApplicationStage = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'

export const STAGES: ApplicationStage[] = ['saved', 'applied', 'interviewing', 'offer', 'rejected']

export const STAGE_META: Record<ApplicationStage, { label: string; color: string; hint: string }> = {
  saved: { label: 'Saved', color: '#6d4aff', hint: 'Shortlisted, not applied yet' },
  applied: { label: 'Applied', color: '#06b6d4', hint: 'Application submitted' },
  interviewing: { label: 'Interviewing', color: '#f59e0b', hint: 'In the loop' },
  offer: { label: 'Offer', color: '#10b981', hint: 'Offer on the table' },
  rejected: { label: 'Closed', color: '#f43f5e', hint: 'No longer moving forward' },
}

export interface Application {
  jobId: string
  stage: ApplicationStage
  /** ISO date string. */
  updatedAt: string
  note?: string
}
