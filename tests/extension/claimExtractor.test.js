import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { loadExtensionScriptIntoContext } from './loadExtensionScript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../extension/utils/claimExtractor.js');

describe('extension: claimExtractor', () => {
  it('extracts likely claim sentences from page text', () => {
    const dom = new JSDOM(
      `<!doctype html><html><body>
        <main>
          According to a study, this battery lasts 48 hours and charges in 30 minutes.
          Another normal statement without indicators.
        </main>
      </body></html>`,
      { url: 'https://example.com' }
    );

    const ctx = loadExtensionScriptIntoContext(scriptPath, {
      window: dom.window,
      document: dom.window.document
    });

    const extractClaimsFromPage = ctx.extractClaimsFromPage;
    const claims = extractClaimsFromPage();

    expect(Array.isArray(claims)).toBe(true);
    expect(claims.length).toBeGreaterThanOrEqual(1);

    const first = claims[0];
    expect(first.text).toMatch(/According to a study/i);
    expect(first.confidence).toBe(60);
  });
});

