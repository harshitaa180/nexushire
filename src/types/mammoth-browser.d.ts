/**
 * mammoth ships types for its Node entry point only; the browser build has no
 * declaration file. We use just `extractRawText`, so declare that narrowly.
 */
declare module 'mammoth/mammoth.browser' {
  export interface RawTextResult {
    value: string
    messages: Array<{ type: string; message: string }>
  }
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<RawTextResult>
}
