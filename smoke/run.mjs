/**
 * Runs the compiled SSR smoke harness under Node with the few browser globals
 * that module-level code touches (zustand's persist storage, framer-motion's
 * reduced-motion query) stubbed out.
 */
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

globalThis.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
})

await import('../smoke-dist/ssr-entry.js')
