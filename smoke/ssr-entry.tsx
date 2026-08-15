/**
 * Throwaway smoke harness: renders every route to a string so a render-time
 * crash surfaces in CI/terminal rather than as a white screen in the browser.
 * Not part of the app bundle — see `npm run smoke`.
 */
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from '../src/App'

const ROUTES = ['/', '/jobs', '/profile', '/insights', '/tracker']

let failed = false

for (const route of ROUTES) {
  try {
    const html = renderToString(
      <StaticRouter location={route}>
        <App />
      </StaticRouter>,
    )
    const size = html.length
    if (size < 500) throw new Error(`suspiciously small render (${size} bytes)`)
    console.log(`  ok   ${route.padEnd(10)} ${size.toLocaleString()} bytes`)
  } catch (error) {
    failed = true
    console.error(`  FAIL ${route.padEnd(10)} ${(error as Error).message}`)
    console.error((error as Error).stack)
  }
}

console.log(failed ? '\nSmoke test FAILED' : '\nAll routes rendered.')
process.exit(failed ? 1 : 0)
