import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, describe, it } from 'vitest';
import { loadExtensionScriptIntoContext } from './loadExtensionScript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../extension/utils/claudeJsonParse.js');

describe('extension: claudeJsonParse', () => {
  it('parses fenced JSON blocks', () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const parseClaudeJsonObject = ctx.parseClaudeJsonObject;

    const rawText = '```json\n{ "rating": "verified", "confidence": 85, "explanation": "ok" }\n```';
    const parsed = parseClaudeJsonObject(rawText);

    expect(parsed).toEqual({
      rating: 'verified',
      confidence: 85,
      explanation: 'ok'
    });
  });

  it('returns null for invalid input', () => {
    const ctx = loadExtensionScriptIntoContext(scriptPath);
    const parseClaudeJsonObject = ctx.parseClaudeJsonObject;

    expect(parseClaudeJsonObject('NOT_JSON')).toBeNull();
    expect(parseClaudeJsonObject(null)).toBeNull();
  });
});

