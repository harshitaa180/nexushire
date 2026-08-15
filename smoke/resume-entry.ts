/**
 * Verifies the résumé pipeline end to end on a real PDF: builds a minimal but
 * valid PDF in memory, runs it through pdf.js with the same API the app uses,
 * then checks the skill extractor and the header-field guesser against it.
 */
import { extractSkills } from '../src/lib/skills'
import { detectFormat, guessFacts } from '../src/lib/resume'

let failed = false

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    console.log(`  ok   ${name}`)
  } else {
    failed = true
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

/* ── Build a minimal one-page PDF with a text layer ──────────────────── */

function buildPdf(lines: string[]): Uint8Array {
  const escape = (s: string) => s.replace(/([()\\])/g, '\\$1')
  const textOps = lines
    .map((line, i) => `BT /F1 12 Tf 40 ${760 - i * 18} Td (${escape(line)}) Tj ET`)
    .join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${textOps.length} >>\nstream\n${textOps}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new TextEncoder().encode(pdf)
}

const RESUME_LINES = [
  'Priya Raman',
  'Senior Frontend Engineer',
  'Frontend engineer with 6 years of professional experience.',
  'Skills: JavaScript, TypeScript, React, Next.js, Tailwind CSS,',
  'Node.js, PostgreSQL, GraphQL, Docker, Jest, Figma, accessibility',
]

async function main() {
  /* ── 1. PDF text extraction via pdf.js ─────────────────────────────── */

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  // In Node the worker has to be pointed at a real file URL; the browser build
  // gets this from Vite's `?url` import instead.
  pdfjs.GlobalWorkerOptions.workerSrc = `file:///${process
    .cwd()
    .replace(/\\/g, '/')}/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs`

  const doc = await pdfjs.getDocument({ data: buildPdf(RESUME_LINES), useWorkerFetch: false })
    .promise
  check('pdf.js opens the document', doc.numPages === 1, `got ${doc.numPages} pages`)

  const content = await (await doc.getPage(1)).getTextContent()
  const text = content.items.map((item) => ('str' in item ? item.str : '')).join('\n')

  check('extracted text is non-trivial', text.length > 80, `${text.length} chars`)
  check('extracted text contains a known skill', /TypeScript/i.test(text), text.slice(0, 120))

  /* ── 2. Skill extraction over the recovered text ───────────────────── */

  const skills = extractSkills(text)
  const expected = [
    'javascript',
    'typescript',
    'react',
    'nextjs',
    'tailwind',
    'nodejs',
    'postgres',
    'graphql',
    'docker',
    'testing',
    'figma',
    'a11y',
  ]
  const missing = expected.filter((id) => !skills.includes(id))

  check(
    `resolves the expected skills (${skills.length} found)`,
    missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : '',
  )
  if (missing.length) {
    console.error(`       text: ${JSON.stringify(text)}`)
    console.error(`       resolved: ${skills.join(', ')}`)
  }

  /* ── 3. Header-field guessing ──────────────────────────────────────── */

  const facts = guessFacts(text)
  check('guesses the name', facts.name === 'Priya Raman', `got ${facts.name}`)
  check(
    'guesses the headline',
    /frontend engineer/i.test(facts.headline ?? ''),
    `got ${facts.headline}`,
  )
  check('guesses years of experience', facts.yearsExperience === 6, `got ${facts.yearsExperience}`)

  /* ── 4. Format detection ───────────────────────────────────────────── */

  const asFile = (name: string, type = '') => ({ name, type }) as File
  check('detects pdf', detectFormat(asFile('cv.pdf')) === 'pdf')
  check('detects docx', detectFormat(asFile('cv.docx')) === 'docx')
  check('detects markdown', detectFormat(asFile('cv.md')) === 'text')
  check('detects rtf', detectFormat(asFile('cv.rtf')) === 'rtf')
  check('flags unknown binaries', detectFormat(asFile('cv.png', 'image/png')) === 'unsupported')

  console.log(failed ? '\nRésumé pipeline FAILED' : '\nRésumé pipeline verified.')
  process.exit(failed ? 1 : 0)
}

void main()
