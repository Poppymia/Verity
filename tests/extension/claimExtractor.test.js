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

  function buildSentenceWithExactTrimLength(targetLength) {
    // The detector only keeps sentences with:
    // - trimmed.length >= 20
    // - trimmed.length <= 300
    // We'll build a single sentence that includes claim indicators.
    //
    // Prefix includes:
    // - "Studies" => matches /study|research|shows?|found|proves?/i
    // - "90%" => matches /\d+%/
    const prefix = 'Studies show 90% ';
    const suffix = '.';
    const fillerLen = targetLength - prefix.length - suffix.length;
    const filler = fillerLen > 0 ? 'a'.repeat(fillerLen) : '';
    return `${prefix}${filler}${suffix}`;
  }

  it('skips sentences with indicator but trimmed length < 20', () => {
    const sentence = buildSentenceWithExactTrimLength(19);
    const dom = new JSDOM(
      `<!doctype html><html><body><main>${sentence}</main></body></html>`,
      { url: 'https://example.com' }
    );

    const ctx = loadExtensionScriptIntoContext(scriptPath, {
      window: dom.window,
      document: dom.window.document
    });

    const extractClaimsFromPage = ctx.extractClaimsFromPage;
    const claims = extractClaimsFromPage();
    expect(claims).toEqual([]);
  });

  it('includes sentences with indicator when trimmed length is exactly 20', () => {
    const sentence = buildSentenceWithExactTrimLength(20);
    const dom = new JSDOM(
      `<!doctype html><html><body><main>${sentence}</main></body></html>`,
      { url: 'https://example.com' }
    );

    const ctx = loadExtensionScriptIntoContext(scriptPath, {
      window: dom.window,
      document: dom.window.document
    });

    const extractClaimsFromPage = ctx.extractClaimsFromPage;
    const claims = extractClaimsFromPage();
    expect(claims.length).toBe(1);
    expect(claims[0].confidence).toBe(60);
    expect(claims[0].text).toBe(sentence);
  });

  it('skips sentences with indicator but trimmed length > 300', () => {
    const sentence = buildSentenceWithExactTrimLength(301);
    const dom = new JSDOM(
      `<!doctype html><html><body><main>${sentence}</main></body></html>`,
      { url: 'https://example.com' }
    );

    const ctx = loadExtensionScriptIntoContext(scriptPath, {
      window: dom.window,
      document: dom.window.document
    });

    const extractClaimsFromPage = ctx.extractClaimsFromPage;
    const claims = extractClaimsFromPage();
    expect(claims).toEqual([]);
  });

  it('includes sentences with indicator when trimmed length is exactly 300', () => {
    const sentence = buildSentenceWithExactTrimLength(300);
    const dom = new JSDOM(
      `<!doctype html><html><body><main>${sentence}</main></body></html>`,
      { url: 'https://example.com' }
    );

    const ctx = loadExtensionScriptIntoContext(scriptPath, {
      window: dom.window,
      document: dom.window.document
    });

    const extractClaimsFromPage = ctx.extractClaimsFromPage;
    const claims = extractClaimsFromPage();
    expect(claims.length).toBe(1);
    expect(claims[0].confidence).toBe(60);
    expect(claims[0].text).toBe(sentence);
  });
});

