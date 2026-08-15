import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Application,
  ApplicationStage,
  CandidateSkill,
  EmploymentType,
  Profile,
  Seniority,
  WorkMode,
} from '@/lib/types'

export type SortKey = 'match' | 'recent' | 'salary' | 'competition'

export interface Filters {
  query: string
  seniority: Seniority[]
  workModes: WorkMode[]
  employmentTypes: EmploymentType[]
  tags: string[]
  minSalary: number
  minMatch: number
  sort: SortKey
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  seniority: [],
  workModes: [],
  employmentTypes: [],
  tags: [],
  minSalary: 0,
  minMatch: 0,
  sort: 'match',
}

/** A believable starting profile so the app is never empty on first load. */
export const DEFAULT_PROFILE: Profile = {
  name: 'Your Name',
  headline: 'Web Developer',
  summary:
    'Web developer focused on building fast, accessible interfaces. Comfortable across the stack with a bias toward the front end, design systems and performance work.',
  skills: [
    { id: 'html', level: 5, years: 4 },
    { id: 'css', level: 5, years: 4 },
    { id: 'javascript', level: 4, years: 4 },
    { id: 'react', level: 4, years: 3 },
    { id: 'typescript', level: 3, years: 2 },
    { id: 'responsive', level: 4, years: 3 },
    { id: 'git', level: 4, years: 4 },
    { id: 'tailwind', level: 4, years: 2 },
    { id: 'restapi', level: 3, years: 2 },
    { id: 'figma', level: 3, years: 2 },
  ],
  yearsExperience: 3,
  seniority: 'mid',
  workModes: ['remote', 'hybrid'],
  region: 'North America',
  minSalary: 90000,
  interests: ['saas', 'devtools', 'creative'],
  onboarded: false,
}

interface AppState {
  profile: Profile
  filters: Filters
  applications: Record<string, Application>
  theme: 'dark' | 'light'
  /** Toggles the "how the score was computed" overlays across the app. */
  explainMode: boolean

  setProfile: (patch: Partial<Profile>) => void
  addSkill: (skill: CandidateSkill) => void
  removeSkill: (id: string) => void
  updateSkill: (id: string, patch: Partial<CandidateSkill>) => void
  mergeSkills: (ids: string[]) => number
  resetProfile: () => void

  setFilters: (patch: Partial<Filters>) => void
  toggleFilter: <K extends 'seniority' | 'workModes' | 'employmentTypes' | 'tags'>(
    key: K,
    value: Filters[K][number],
  ) => void
  clearFilters: () => void

  setStage: (jobId: string, stage: ApplicationStage) => void
  setNote: (jobId: string, note: string) => void
  removeApplication: (jobId: string) => void
  toggleSaved: (jobId: string) => void

  toggleTheme: () => void
  toggleExplain: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      filters: EMPTY_FILTERS,
      applications: {},
      theme: 'dark',
      explainMode: true,

      setProfile: (patch) => set((st) => ({ profile: { ...st.profile, ...patch } })),

      addSkill: (skill) =>
        set((st) => {
          if (st.profile.skills.some((s) => s.id === skill.id)) return st
          return { profile: { ...st.profile, skills: [...st.profile.skills, skill] } }
        }),

      removeSkill: (id) =>
        set((st) => ({
          profile: { ...st.profile, skills: st.profile.skills.filter((s) => s.id !== id) },
        })),

      updateSkill: (id, patch) =>
        set((st) => ({
          profile: {
            ...st.profile,
            skills: st.profile.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          },
        })),

      /** Adds any ids not already present. Returns how many were new. */
      mergeSkills: (ids) => {
        const existing = new Set(get().profile.skills.map((s) => s.id))
        const fresh = ids.filter((id) => !existing.has(id))
        if (fresh.length) {
          set((st) => ({
            profile: {
              ...st.profile,
              skills: [...st.profile.skills, ...fresh.map((id) => ({ id, level: 3, years: 1 }))],
            },
          }))
        }
        return fresh.length
      },

      resetProfile: () => set({ profile: DEFAULT_PROFILE }),

      setFilters: (patch) => set((st) => ({ filters: { ...st.filters, ...patch } })),

      toggleFilter: (key, value) =>
        set((st) => {
          const current = st.filters[key] as string[]
          const next = current.includes(value as string)
            ? current.filter((v) => v !== value)
            : [...current, value as string]
          return { filters: { ...st.filters, [key]: next } }
        }),

      clearFilters: () => set((st) => ({ filters: { ...EMPTY_FILTERS, sort: st.filters.sort } })),

      setStage: (jobId, stage) =>
        set((st) => ({
          applications: {
            ...st.applications,
            [jobId]: {
              ...(st.applications[jobId] ?? { jobId, note: '' }),
              jobId,
              stage,
              updatedAt: new Date().toISOString(),
            },
          },
        })),

      setNote: (jobId, note) =>
        set((st) => {
          const existing = st.applications[jobId]
          if (!existing) return st
          return {
            applications: {
              ...st.applications,
              [jobId]: { ...existing, note, updatedAt: new Date().toISOString() },
            },
          }
        }),

      removeApplication: (jobId) =>
        set((st) => {
          const next = { ...st.applications }
          delete next[jobId]
          return { applications: next }
        }),

      toggleSaved: (jobId) => {
        const existing = get().applications[jobId]
        if (existing) get().removeApplication(jobId)
        else get().setStage(jobId, 'saved')
      },

      toggleTheme: () => set((st) => ({ theme: st.theme === 'dark' ? 'light' : 'dark' })),
      toggleExplain: () => set((st) => ({ explainMode: !st.explainMode })),
    }),
    {
      name: 'nexushire.v1',
      partialize: (st) => ({
        profile: st.profile,
        applications: st.applications,
        theme: st.theme,
        explainMode: st.explainMode,
      }),
    },
  ),
)
