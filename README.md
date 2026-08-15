# NexusHire — AI Job Matching Portal

A job portal that scores every opening against your profile across six weighted
dimensions, then **shows its work**: the arithmetic behind the number, the skills
you're missing, and a simulation of which single skill would move your match the most.

Built as a front-end engineering showcase — React, TypeScript, Vite, Tailwind CSS v4
and Framer Motion, with the entire matching engine running client-side.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run smoke    # server-render every route to catch render crashes
```

---

## The matching engine

The interesting part of this project isn't the UI — it's [`src/lib/matching.ts`](src/lib/matching.ts).
Every match score is a transparent weighted sum, not an opaque embedding distance:

| Facet | Weight | What it measures |
| --- | --- | --- |
| Skill coverage | 42% | Weighted requirement coverage, softened by proficiency and adjacency |
| Experience depth | 16% | Quadratic penalty below the bar, gentle taper above it |
| Seniority alignment | 12% | Distance along the intern → lead ladder |
| Location & work mode | 12% | Remote/hybrid/on-site compatibility and region |
| Compensation fit | 10% | Where your salary floor sits inside the posted band |
| Domain affinity | 8% | Tag overlap plus TF-IDF cosine similarity on the posting text |

Three design decisions drive it:

**1. Adjacent skills earn partial credit.**
[`src/lib/skills.ts`](src/lib/skills.ts) encodes a weighted skill graph. A posting
wants Next.js and you only list React? You get 0.62 credit rather than a zero,
because that's how expertise actually transfers. The graph is bidirectional with
asymmetric weights — knowing Next.js implies React more strongly than the reverse.

**2. Counterfactual uplift.**
For each gap, the engine literally re-runs the whole model with that skill added at
intermediate proficiency and reports the delta — *"learn GraphQL → 74% becomes 83%."*
Not a heuristic; an actual second pass through the scorer.

**3. TF-IDF over the corpus.**
The IDF table and per-job vectors are built once at module load, so the semantic
similarity between your summary and each posting costs a sparse dot product. The
whole board rescoring on every keystroke stays imperceptible.

## Résumé parsing

Paste résumé text and an n-gram scanner (up to trigrams, longest-match-wins) resolves
70+ skills and their aliases — `ES6`, `react.js`, `Core Web Vitals`, `k8s` — against
the canonical taxonomy. Runs entirely in the browser; nothing is uploaded.

## What's in the app

- **Discover** — filterable, sortable board; every card carries a live match dial
- **Job detail** — full score composition with a radar chart, per-facet meters and
  reasoning, covered/missing skill verdicts, and clickable uplift simulations
- **Profile** — skill editor with proficiency levels, preferences, and résumé import
- **Insights** — corpus-wide aggregates: facet radar, tier distribution, score
  histogram, and highest-leverage skill gaps weighted by demand and pay
- **Tracker** — a five-stage application pipeline persisted to localStorage

## Design & front-end notes

- **Tailwind CSS v4** with a token-driven theme — every colour, surface and shadow is
  a CSS custom property, so the light/dark switch is a single class on `<html>`
- **Custom `@utility` layer** for the glassmorphism, gradient-border and grid treatments
- **All charts are hand-rolled SVG** (radar, donut, histogram, sparkline, bar list) —
  no charting dependency, and they inherit the design tokens exactly
- **Framer Motion** throughout: shared-layout nav pills, spring-driven drawer,
  staggered card entrances, path-drawing underlines, animated score dials
- **Accessibility** — semantic landmarks, keyboard-operable cards and drawer,
  visible focus rings, `prefers-reduced-motion` honoured globally
- **No backend.** State lives in Zustand with a localStorage persist layer

## Project structure

```
src/
  lib/
    matching.ts     the scoring engine, TF-IDF, gap analysis, uplift simulation
    skills.ts       skill taxonomy, alias index, adjacency graph, résumé extractor
    jobs.ts         26-posting corpus
    types.ts        domain model and match tiers
  hooks/useMatches  memoised scoring + filtering
  store/            Zustand store with persistence
  components/
    jobs/           card, detail drawer, score breakdown, filter bar
    charts/         hand-rolled SVG chart primitives
    ui/             buttons, chips, meters, score rings
    visual/         animated backdrop and spotlight
  pages/            Landing, Jobs, Profile, Insights, Tracker
smoke/              SSR render harness used by `npm run smoke`
```

## Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · Framer Motion · Zustand ·
React Router · Lucide icons
