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

## Résumé import

Drag in a **PDF, Word (.docx), TXT, Markdown, RTF or HTML** file — or paste text.
An n-gram scanner (up to trigrams, longest-match-wins) resolves 65 skills and their
aliases — `ES6`, `react.js`, `Core Web Vitals`, `k8s` — against the canonical taxonomy,
and a conservative header scrape fills in your name, headline and years of experience.

Everything runs in the browser: `pdf.js` and `mammoth` are **dynamically imported**, so
neither lands in the main bundle unless you actually drop a file in. Nothing is uploaded
anywhere. Failure modes are handled explicitly — password-protected PDFs, scanned PDFs
with no text layer, legacy `.doc`, and images all get a specific message and a way forward.

## What's in the app

- **Discover** — filterable, sortable board; every card carries a live match dial
- **Job detail** — full score composition with a radar chart, per-facet meters and
  reasoning, covered/missing skill verdicts, and clickable uplift simulations
- **Profile** — skill editor with proficiency levels, preferences, and résumé import
- **Insights** — corpus-wide aggregates: facet radar, tier distribution, score
  histogram, and highest-leverage skill gaps weighted by demand and pay
- **Tracker** — a five-stage application pipeline persisted to localStorage

## Motion & visuals

The background is **not** a video file or a static image — it is two live canvases:

- **`FluidCanvas`** paints six drifting colour fields with additive blending, rendered
  into a quarter-resolution buffer and scaled up under a heavy CSS blur. That is the
  whole trick: a ~480×270 buffer costs almost nothing to paint, and once blurred it is
  indistinguishable from a full-res render — full 60fps motion for a few KB instead of a
  multi-megabyte clip that would still look softer on a retina display.
- **`ParticleField`** adds a crisp constellation layer on top, at full resolution with a
  DPR cap of 2 and a per-area particle budget.

Both pause on tab-hide and render a single static frame under `prefers-reduced-motion`.
`MediaBand` composes them into tinted section backgrounds, and each page gets its own
palette preset so the app feels varied while sharing one motion language.

`DemoReel` is a **scripted product reel** — a four-scene looping "screencast" assembled
from live DOM rather than recorded. `VideoPanel` wraps it and will play a real `<video>`
instead if you drop one into `public/media/` (see the README there); if that file is
missing or fails to decode, it falls back to the reel, so the page can never show a hole.

Elsewhere:

- **Tailwind CSS v4** with a token-driven theme — every colour, surface and shadow is a
  CSS custom property, so light/dark is a single class on `<html>`
- **All charts are hand-rolled SVG** (radar, donut, histogram, sparkline, bar list) —
  no charting dependency, and they inherit the design tokens exactly
- **Framer Motion** throughout: scroll-linked progress, word-by-word headline reveals
  behind clip masks, count-up numerals, rules that draw themselves in, a shared-layout
  nav underline, spring-driven drawer, and staggered scroll reveals
- **Accessibility** — semantic landmarks, keyboard-operable cards, drawer and dropzone,
  visible focus rings, `prefers-reduced-motion` honoured globally
- **No backend.** State lives in Zustand with a localStorage persist layer

## Verification

`npm run verify` runs three gates, and CI runs the same three before every deploy:

| Script | What it proves |
| --- | --- |
| `npm run build` | Typechecks under `strict` and produces the bundle |
| `npm run smoke` | Server-renders all five routes — catches render-time crashes |
| `npm run test:resume` | Builds a real PDF in memory, runs it through pdf.js, and asserts the skill extractor and header scraper recover the right values |

That third one is not decoration: it caught a genuine tokenizer bug where newlines were
being *deleted* rather than converted to spaces, so `Tailwind CSS,\nNode.js` collapsed to
`cssnode js` and silently dropped the first skill on every line of a real résumé.

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
