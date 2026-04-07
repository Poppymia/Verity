import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { loadExtensionScriptIntoContext } from './loadExtensionScript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../extension/utils/domainScoring.js');

describe('extension: domainScoring', () => {
  it('extracts domains and normalizes www.', () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const extractDomain = ctx.extractDomain;

    expect(extractDomain('https://www.reuters.com/some')).toBe('reuters.com');
    expect(extractDomain('https://reuters.com/some')).toBe('reuters.com');
    expect(extractDomain('not-a-url')).toBeNull();
  });

  it('returns base scores for known trusted domains', () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const getDomainScore = ctx.getDomainScore;

    const s = getDomainScore('reuters.com');
    expect(s.status).toBe('trusted');
    expect(s.color).toBe('green');
    expect(s.score).toBe(90);
    expect(s.category).toBe('news');
  });

  it('analyzes domain with HTTPS bonus and sets final status', async () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const analyzeDomain = ctx.analyzeDomain;

    const resHttps = await analyzeDomain('https://www.reuters.com/some');
    expect(resHttps.domain).toBe('reuters.com');
    expect(resHttps.hasHttps).toBe(true);
    expect(resHttps.score).toBe(92); // 90 + 2
    expect(resHttps.status).toBe('trusted');
    expect(resHttps.color).toBe('green');

    const resHttp = await analyzeDomain('http://www.reuters.com/some');
    expect(resHttp.domain).toBe('reuters.com');
    expect(resHttp.hasHttps).toBe(false);
    expect(resHttp.score).toBe(85); // 90 - 5
    expect(resHttp.status).toBe('trusted');
    expect(resHttp.color).toBe('green');
  });

  it('maps scores to UI color/status helpers', () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const getScoreColorClass = ctx.getScoreColorClass;
    const getStatusText = ctx.getStatusText;

    // Boundary examples: 49/50 and 79/80
    expect(getScoreColorClass(80)).toBe('trust-high');
    expect(getScoreColorClass(79)).toBe('trust-medium');
    expect(getScoreColorClass(50)).toBe('trust-medium');
    expect(getScoreColorClass(49)).toBe('trust-low');

    expect(getStatusText(80)).toBe('Highly Trusted');
    expect(getStatusText(79)).toBe('Generally Trusted');
    expect(getStatusText(65)).toBe('Generally Trusted');
    expect(getStatusText(50)).toBe('Use Caution');
    expect(getStatusText(49)).toBe('Low Trust');
    expect(getStatusText(30)).toBe('Low Trust');
    expect(getStatusText(10)).toBe('High Risk');
  });
});

