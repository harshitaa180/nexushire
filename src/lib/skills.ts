/**
 * Skill taxonomy.
 *
 * Every skill has a canonical id, display label, category, and a list of
 * aliases used by the résumé parser. `related` encodes an adjacency graph with
 * transfer weights: if a job wants `nextjs` and the candidate only has `react`,
 * they still earn partial credit (0.6) rather than a flat zero. That single
 * idea is what makes the matcher feel "AI" rather than a set-intersection.
 */

export type SkillCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'data'
  | 'infra'
  | 'design'
  | 'practice'

export interface Skill {
  id: string
  label: string
  category: SkillCategory
  aliases: string[]
  /** skillId -> transfer weight (0–1) applied when this skill stands in for it. */
  related: Record<string, number>
  /** Rough market demand 0–100, used for the skill-gap ranking + dashboard. */
  demand: number
}

export const CATEGORY_META: Record<SkillCategory, { label: string; color: string }> = {
  language: { label: 'Languages', color: '#6d4aff' },
  frontend: { label: 'Frontend', color: '#06b6d4' },
  backend: { label: 'Backend', color: '#10b981' },
  data: { label: 'Data & AI', color: '#c026d3' },
  infra: { label: 'Infra & DevOps', color: '#f59e0b' },
  design: { label: 'Design', color: '#f43f5e' },
  practice: { label: 'Practices', color: '#0ea5e9' },
}

const raw: Array<
  [string, string, SkillCategory, number, string[], Record<string, number>]
> = [
  // ── Languages ────────────────────────────────────────────────
  ['javascript', 'JavaScript', 'language', 96, ['js', 'es6', 'ecmascript', 'vanilla js'], { typescript: 0.75, nodejs: 0.4 }],
  ['typescript', 'TypeScript', 'language', 94, ['ts'], { javascript: 0.9 }],
  ['python', 'Python', 'language', 92, ['py', 'python3'], { django: 0.35, fastapi: 0.35 }],
  ['go', 'Go', 'language', 74, ['golang'], { rust: 0.25 }],
  ['rust', 'Rust', 'language', 62, ['rustlang'], { go: 0.25, cpp: 0.3 }],
  ['java', 'Java', 'language', 80, ['java8', 'java17'], { kotlin: 0.6, spring: 0.4 }],
  ['kotlin', 'Kotlin', 'language', 55, [], { java: 0.65 }],
  ['csharp', 'C#', 'language', 68, ['c#', 'dotnet', '.net'], { java: 0.4 }],
  ['php', 'PHP', 'language', 58, ['php8', 'laravel-php'], { laravel: 0.5 }],
  ['ruby', 'Ruby', 'language', 48, ['ruby on rails lang'], { rails: 0.6 }],
  ['cpp', 'C++', 'language', 57, ['c++', 'cplusplus'], { rust: 0.3 }],
  ['sql', 'SQL', 'language', 90, ['tsql', 'plsql', 'ansi sql'], { postgres: 0.6, mysql: 0.6 }],

  // ── Frontend ─────────────────────────────────────────────────
  ['react', 'React', 'frontend', 98, ['reactjs', 'react.js', 'react 18', 'react hooks'], { nextjs: 0.62, vue: 0.35, preact: 0.8 }],
  ['nextjs', 'Next.js', 'frontend', 88, ['next', 'next.js', 'nextjs 14'], { react: 0.8, ssr: 0.5 }],
  ['vue', 'Vue.js', 'frontend', 66, ['vuejs', 'vue3', 'vue.js', 'nuxt'], { react: 0.4, svelte: 0.35 }],
  ['angular', 'Angular', 'frontend', 58, ['angularjs', 'angular2'], { typescript: 0.4, react: 0.3 }],
  ['svelte', 'Svelte', 'frontend', 44, ['sveltekit'], { vue: 0.35, react: 0.35 }],
  ['html', 'HTML5', 'frontend', 89, ['html5', 'semantic html', 'markup'], { css: 0.5, accessibility: 0.35 }],
  ['css', 'CSS', 'frontend', 91, ['css3', 'scss', 'sass', 'less', 'styled-components'], { tailwind: 0.55, html: 0.5 }],
  ['tailwind', 'Tailwind CSS', 'frontend', 82, ['tailwindcss', 'tailwind css'], { css: 0.7 }],
  ['redux', 'Redux', 'frontend', 60, ['redux toolkit', 'rtk', 'zustand', 'state management'], { react: 0.45 }],
  ['webpack', 'Build Tooling', 'frontend', 63, ['vite', 'rollup', 'esbuild', 'bundler', 'webpack 5'], { javascript: 0.3 }],
  ['a11y', 'Accessibility', 'frontend', 71, ['accessibility', 'wcag', 'aria', 'a11y'], { html: 0.45, css: 0.3 }],
  ['responsive', 'Responsive Design', 'frontend', 84, ['mobile-first', 'media queries', 'adaptive design'], { css: 0.6, tailwind: 0.45 }],
  ['animation', 'Web Animation', 'frontend', 58, ['framer motion', 'gsap', 'css animation', 'motion design'], { css: 0.45, react: 0.25 }],
  ['webperf', 'Web Performance', 'frontend', 76, ['core web vitals', 'lighthouse', 'performance optimization'], { javascript: 0.35, webpack: 0.4 }],
  ['reactnative', 'React Native', 'frontend', 61, ['react-native', 'expo'], { react: 0.65 }],

  // ── Backend ──────────────────────────────────────────────────
  ['nodejs', 'Node.js', 'backend', 90, ['node', 'node.js', 'express', 'expressjs', 'nestjs'], { javascript: 0.6, typescript: 0.45 }],
  ['restapi', 'REST APIs', 'backend', 93, ['rest', 'restful', 'api design', 'openapi'], { nodejs: 0.45, graphql: 0.5 }],
  ['graphql', 'GraphQL', 'backend', 70, ['apollo', 'relay', 'gql'], { restapi: 0.45, nodejs: 0.3 }],
  ['django', 'Django', 'backend', 55, ['django rest framework', 'drf'], { python: 0.6 }],
  ['fastapi', 'FastAPI', 'backend', 58, ['fast api'], { python: 0.6, restapi: 0.5 }],
  ['spring', 'Spring Boot', 'backend', 62, ['springboot', 'spring framework'], { java: 0.65 }],
  ['rails', 'Ruby on Rails', 'backend', 40, ['ror', 'rails 7'], { ruby: 0.7 }],
  ['laravel', 'Laravel', 'backend', 46, ['laravel 10'], { php: 0.7 }],
  ['auth', 'Auth & Security', 'backend', 79, ['oauth', 'jwt', 'authentication', 'authorization', 'sso', 'appsec'], { restapi: 0.35 }],
  ['microservices', 'Microservices', 'backend', 72, ['service oriented', 'distributed systems', 'event driven'], { docker: 0.4, kubernetes: 0.45 }],
  ['websockets', 'Realtime / WebSockets', 'backend', 54, ['socket.io', 'websocket', 'sse', 'realtime'], { nodejs: 0.4 }],

  // ── Data ─────────────────────────────────────────────────────
  ['postgres', 'PostgreSQL', 'data', 86, ['postgresql', 'psql'], { sql: 0.75, mysql: 0.6 }],
  ['mysql', 'MySQL', 'data', 68, ['mariadb'], { sql: 0.75, postgres: 0.6 }],
  ['mongodb', 'MongoDB', 'data', 64, ['mongo', 'nosql', 'dynamodb'], { postgres: 0.3 }],
  ['redis', 'Redis', 'data', 66, ['caching', 'memcached'], { postgres: 0.2 }],
  ['ml', 'Machine Learning', 'data', 83, ['machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn'], { python: 0.4, llm: 0.5 }],
  ['llm', 'LLM / GenAI', 'data', 95, ['genai', 'openai', 'langchain', 'rag', 'prompt engineering', 'anthropic'], { ml: 0.45, python: 0.3 }],
  ['analytics', 'Product Analytics', 'data', 61, ['mixpanel', 'amplitude', 'ab testing', 'experimentation'], { sql: 0.4 }],
  ['dataviz', 'Data Visualization', 'data', 57, ['d3', 'd3.js', 'charting', 'recharts'], { javascript: 0.35, css: 0.25 }],

  // ── Infra ────────────────────────────────────────────────────
  ['git', 'Git', 'infra', 95, ['github', 'gitlab', 'version control'], { cicd: 0.4 }],
  ['docker', 'Docker', 'infra', 84, ['containers', 'containerization'], { kubernetes: 0.55 }],
  ['kubernetes', 'Kubernetes', 'infra', 71, ['k8s', 'eks', 'gke'], { docker: 0.6 }],
  ['aws', 'AWS', 'infra', 88, ['amazon web services', 'ec2', 's3', 'lambda'], { gcp: 0.55, azure: 0.55 }],
  ['gcp', 'GCP', 'infra', 58, ['google cloud'], { aws: 0.6, azure: 0.5 }],
  ['azure', 'Azure', 'infra', 60, ['microsoft azure'], { aws: 0.6, gcp: 0.5 }],
  ['cicd', 'CI/CD', 'infra', 82, ['continuous integration', 'github actions', 'jenkins', 'circleci'], { git: 0.4, docker: 0.35 }],
  ['terraform', 'Terraform / IaC', 'infra', 63, ['iac', 'infrastructure as code', 'pulumi'], { aws: 0.4 }],
  ['observability', 'Observability', 'infra', 59, ['monitoring', 'datadog', 'sentry', 'grafana', 'logging'], { cicd: 0.3 }],
  ['edge', 'Edge / Serverless', 'infra', 67, ['vercel', 'cloudflare workers', 'netlify', 'serverless'], { nodejs: 0.35, aws: 0.35 }],

  // ── Design ───────────────────────────────────────────────────
  ['figma', 'Figma', 'design', 72, ['sketch', 'adobe xd', 'design tools'], { uiux: 0.6 }],
  ['uiux', 'UI/UX Design', 'design', 78, ['ui design', 'ux', 'user experience', 'interaction design'], { figma: 0.55, designsystems: 0.6 }],
  ['designsystems', 'Design Systems', 'design', 70, ['component library', 'storybook', 'atomic design'], { uiux: 0.55, css: 0.4 }],

  // ── Practices ────────────────────────────────────────────────
  ['testing', 'Testing', 'practice', 85, ['jest', 'vitest', 'cypress', 'playwright', 'tdd', 'unit testing', 'e2e'], { cicd: 0.35 }],
  ['agile', 'Agile / Scrum', 'practice', 74, ['scrum', 'kanban', 'sprint planning'], { collaboration: 0.4 }],
  ['codereview', 'Code Review', 'practice', 69, ['peer review', 'pull requests', 'mentoring'], { git: 0.45, collaboration: 0.4 }],
  ['collaboration', 'Cross-team Collaboration', 'practice', 77, ['communication', 'stakeholder management', 'teamwork'], { agile: 0.4 }],
  ['architecture', 'System Architecture', 'practice', 76, ['system design', 'technical design', 'scalability'], { microservices: 0.5 }],
  ['seo', 'SEO', 'practice', 52, ['search engine optimization', 'ssr seo', 'meta tags'], { webperf: 0.4, html: 0.35 }],
]

export const SKILLS: Skill[] = raw.map(([id, label, category, demand, aliases, related]) => ({
  id,
  label,
  category,
  demand,
  aliases,
  related,
}))

export const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]))

export function skillLabel(id: string): string {
  return SKILL_BY_ID.get(id)?.label ?? id
}

export function skillCategory(id: string): SkillCategory {
  return SKILL_BY_ID.get(id)?.category ?? 'practice'
}

export function skillColor(id: string): string {
  return CATEGORY_META[skillCategory(id)].color
}

/**
 * Transfer weight from `have` → `want`. 1 when identical, 0 when unrelated.
 * The graph is stored one-directionally, so we check both edges and keep the
 * stronger claim (knowing Next.js implies React more than the reverse).
 */
export function transfer(have: string, want: string): number {
  if (have === want) return 1
  const a = SKILL_BY_ID.get(have)?.related[want] ?? 0
  const b = SKILL_BY_ID.get(want)?.related[have] ?? 0
  return Math.max(a, b)
}

/** Lookup index: alias/label/id (normalised) → canonical skill id. */
const ALIAS_INDEX = (() => {
  const index = new Map<string, string>()
  for (const skill of SKILLS) {
    const keys = [skill.id, skill.label, ...skill.aliases]
    for (const key of keys) {
      const norm = normalise(key)
      if (norm && !index.has(norm)) index.set(norm, skill.id)
    }
  }
  return index
})()

export function normalise(text: string): string {
  return (
    text
      .toLowerCase()
      // Separators inside a token become word boundaries: "node.js" → "node js".
      .replace(/[._/\\]/g, ' ')
      // Everything else that isn't a valid token character collapses to a single
      // space. This has to *replace* rather than delete — deleting would splice
      // words together across line breaks ("CSS,\nNode.js" → "cssnode js") and
      // silently lose the skill at the start of every line.
      .replace(/[^a-z0-9+#]+/g, ' ')
      .trim()
  )
}

/**
 * Extract canonical skill ids from free text (a pasted résumé, a bio, …).
 * Scans n-grams up to length 3 so multi-word aliases like "core web vitals"
 * are found, and prefers the longest match at each position.
 */
export function extractSkills(text: string): string[] {
  const words = normalise(text).split(' ').filter(Boolean)
  const found = new Set<string>()

  for (let i = 0; i < words.length; i++) {
    for (let n = Math.min(3, words.length - i); n >= 1; n--) {
      const gram = words.slice(i, i + n).join(' ')
      const hit = ALIAS_INDEX.get(gram)
      if (hit) {
        found.add(hit)
        i += n - 1
        break
      }
    }
  }
  return [...found]
}
