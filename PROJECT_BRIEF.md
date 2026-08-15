# NexusHire — Project Brief

> Paste this whole file into Claude and ask it to turn it into resume bullets for a
> specific job description. Everything below is factually accurate about the built
> project — do not let it be embellished beyond this.

**Live demo:** https://harshitaa180.github.io/nexushire/
**Source:** https://github.com/harshitaa180/nexushire

---

## One-line summary

An AI-powered job portal with an explainable matching engine that scores 26 job
postings against a candidate profile across six weighted dimensions and shows the
reasoning behind every point — built as a solo front-end project with no backend.

## What it does

A candidate uploads a résumé (PDF, Word, or plain text). The app parses it in the
browser, resolves the text against a 65-skill taxonomy, and scores every job posting
in the corpus. Each result explains itself: which requirements are covered, which are
missing, how heavily the posting weights each one, and — the differentiating feature —
which single missing skill would raise the match score the most, computed by re-running
the entire scoring model with that skill added.

Five screens: a landing page, a filterable job board, a profile/résumé builder, an
analytics dashboard, and a five-stage application tracker.

## Technical highlights

**Matching engine (`src/lib/matching.ts`)**
- Six independently-computed facets combined into a weighted sum: skill coverage (42%),
  experience depth (16%), seniority alignment (12%), location & work mode (12%),
  compensation fit (10%), domain affinity (8%).
- Every facet returns both a 0–100 score and a generated sentence of justification, so
  no number in the UI is unexplained.
- Non-linear scoring where it matters: a quadratic penalty for falling below a role's
  experience bar, a gentle taper for being over-qualified, and compensation scored by
  *where* the candidate's floor sits inside the posted band rather than a binary pass/fail.

**Weighted skill-adjacency graph (`src/lib/skills.ts`)**
- 65 skills with aliases and a bidirectional, asymmetrically-weighted "related" graph.
- A posting requiring Next.js gives ~0.62 credit to a candidate who only lists React,
  because expertise transfers — a plain set-intersection would score that as zero.
- Asymmetric by design: knowing Next.js implies React more strongly than the reverse.

**Counterfactual uplift simulation**
- For each unmet requirement, the engine clones the profile with that skill added at
  intermediate proficiency and re-runs the full model, reporting the true delta
  ("learn GraphQL → 74% becomes 83%"). It is a second pass through the scorer, not an
  estimate.

**TF-IDF semantic similarity**
- Custom tokenizer, stop-word list, IDF table and sparse cosine similarity implemented
  from scratch — no NLP library.
- The IDF table and per-job vectors are precomputed once at module load, so re-scoring
  the whole corpus on every filter keystroke stays imperceptible.

**Client-side résumé parsing (`src/lib/resume.ts`)**
- Accepts PDF, DOCX, TXT, Markdown, RTF and HTML via drag-and-drop or file picker.
- `pdf.js` and `mammoth` are **dynamically imported**, keeping ~980KB of parser out of
  the main bundle for users who never upload a file.
- N-gram scanner (up to trigrams, longest-match-wins) resolves aliases like `ES6`,
  `react.js`, `Core Web Vitals`, `k8s` to canonical skill IDs.
- Explicit, actionable error handling for password-protected PDFs, scanned PDFs with no
  text layer, legacy `.doc`, images, and oversized files.
- Nothing is uploaded — all parsing happens in the browser.

**Real-time animated graphics**
- Backgrounds are two live `<canvas>` layers, not video files or images. `FluidCanvas`
  renders six additively-blended colour fields into a quarter-resolution buffer that is
  scaled up under a heavy CSS blur — full 60fps motion for a few KB, where an equivalent
  video would be multiple megabytes and softer on a retina display.
- `ParticleField` adds a full-resolution constellation layer with a device-pixel-ratio
  cap and a per-area particle budget.
- Both pause on tab-hide and degrade to a single static frame under
  `prefers-reduced-motion`.

**Hand-rolled SVG data visualisation**
- Radar chart, donut, histogram, sparkline and bar list all written from scratch against
  the design tokens — no charting dependency in the bundle.

**Design system**
- Tailwind CSS v4 with a fully token-driven theme: every colour, surface, radius and
  shadow is a CSS custom property, so light/dark is one class on `<html>`.
- Custom `@utility` layer and a shared Framer Motion vocabulary (scroll-linked progress,
  word-by-word headline reveals behind clip masks, count-up numerals, self-drawing rules,
  marquee, parallax, spring-driven drawer).

**Engineering practice**
- TypeScript in `strict` mode with `noUnusedLocals`/`noUnusedParameters`.
- Three CI gates before every deploy: typecheck + build; an SSR harness that
  server-renders all five routes to catch render-time crashes; and an end-to-end résumé
  test that constructs a valid PDF in memory, runs it through pdf.js, and asserts the
  extractor recovers the expected skills and header fields.
- **That test caught a real bug**: the tokenizer deleted characters outside its allowed
  set instead of replacing them, so a newline spliced words together —
  `Tailwind CSS,\nNode.js` became `cssnode js`, silently dropping the first skill on every
  line of a real résumé.
- Deployed via GitHub Actions to GitHub Pages, including the base-path and SPA-fallback
  handling a client-routed app needs on a project site.

## Scale / facts

| | |
| --- | --- |
| Source files | 32 TypeScript/TSX files, ~6,900 lines |
| Job corpus | 26 postings with weighted skill requirements |
| Skill taxonomy | 65 skills, with aliases and an adjacency graph |
| Scoring facets | 6, independently weighted |
| Runtime dependencies | 9 |
| Main bundle | ~462KB (~150KB gzipped), parsers code-split out |
| Backend | None — everything runs client-side |

---

## Tech stack

**Core**
- React 18
- TypeScript 5.7 (strict)
- Vite 6

**Styling & motion**
- Tailwind CSS v4 (`@theme` / `@utility`, token-driven light & dark)
- Framer Motion 11
- Custom CSS design-token system

**State & routing**
- Zustand 5 (with `persist` middleware → localStorage)
- React Router 6

**Data & parsing**
- `pdfjs-dist` — PDF text extraction (dynamically imported)
- `mammoth` — DOCX text extraction (dynamically imported)
- Custom TF-IDF, tokenizer and cosine-similarity implementation
- Custom n-gram alias resolver

**Graphics**
- HTML5 Canvas 2D (two real-time animated background engines)
- Hand-written SVG charts (radar, donut, histogram, sparkline, bar list)

**Icons**
- `lucide-react`

**Tooling & delivery**
- GitHub Actions CI (typecheck → build → SSR smoke test → résumé pipeline test → deploy)
- GitHub Pages
- Vite SSR builds used as a test harness

---

## Suggested resume framing

Best positioned as a **front-end / web developer** project. The strongest talking points,
in order:

1. The explainable scoring engine and the skill-adjacency graph — real algorithm design,
   not CRUD.
2. The counterfactual uplift simulation — an unusual, memorable feature.
3. Client-side PDF/DOCX parsing with dynamic imports for bundle discipline.
4. Real-time canvas graphics with an explicit performance strategy.
5. The testing story, including the bug the tests caught.

Avoid claiming machine learning or a trained model. The honest and more impressive framing
is "explainable, deterministic scoring engine with information-retrieval techniques
(TF-IDF, cosine similarity) implemented from scratch."
