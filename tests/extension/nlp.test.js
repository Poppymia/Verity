import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { loadExtensionScriptIntoContext } from './loadExtensionScript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../extension/utils/nlp.js');

describe('extension: nlp', () => {
  it('extracts likely claims and computes confidence', () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const extractClaims = ctx.extractClaims;

    const text =
      'This product lasts 48 hours and charges in 30 minutes, according to a study. ' +
      'The sky is blue.';

    const claims = extractClaims(text);
    expect(Array.isArray(claims)).toBe(true);
    expect(claims.length).toBeGreaterThanOrEqual(1);

    // Ensure the detector picks the obvious claim sentence.
    const firstClaim = claims.find((c) => /lasts 48 hours/i.test(c.text));
    expect(firstClaim).toBeTruthy();
    // Confidence starts at 50, +15 for digits, +10 for authority ("study"), +10 for product claims = 85 (capped at 95).
    expect(firstClaim.confidence).toBe(85);
  });

  it('returns empty list for non-claim text', () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const extractClaims = ctx.extractClaims;

    const claims = extractClaims('Cats purr softly on sunny days. The sky is blue.');
    expect(claims).toEqual([]);
  });
});

