export function parseClaudeJsonObject(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let s = rawText.trim();

  // Extract fenced JSON blocks first.
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)```/im);
  if (fence) s = fence[1].trim();

  // Direct parse if it is already pure JSON.
  try {
    return JSON.parse(s);
  } catch (_) {}

  // Otherwise attempt to locate the first JSON object and parse until balanced braces.
  const start = s.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (inString) {
      if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(s.slice(start, i + 1));
        } catch (_) {
          return null;
        }
      }
    }
  }

  return null;
}

