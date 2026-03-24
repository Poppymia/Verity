// Minimal backend for Verity to integrate structured fact-checks + Claude AI
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: Set these environment variables when running the server
const GOOGLE_FACT_CHECK_API_KEY = process.env.GOOGLE_FACT_CHECK_API_KEY || '';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

const FACT_CHECK_ENDPOINT = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
const FACT_CHECK_MAX_RESULTS = 5;

const CLAUDE_MESSAGES_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5';

function parseClaudeJsonObject(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let s = rawText.trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)```/im);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s);
  } catch (_) {}
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

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Verify a single claim
app.post('/api/verify-claim', async (req, res) => {
  const { claim } = req.body || {};

  if (!claim || typeof claim !== 'string') {
    return res.status(400).json({ error: 'Missing claim text' });
  }

  try {
    // 1) Try Google Fact Check
    let factChecks = [];

    if (GOOGLE_FACT_CHECK_API_KEY) {
      const url =
        `${FACT_CHECK_ENDPOINT}?query=${encodeURIComponent(claim)}` +
        `&key=${GOOGLE_FACT_CHECK_API_KEY}&languageCode=en&maxResults=${FACT_CHECK_MAX_RESULTS}`;

      const fcResp = await fetch(url);
      if (fcResp.ok) {
        const data = await fcResp.json();
        if (Array.isArray(data.claims)) {
          factChecks = data.claims;
        }
      }
    }

    if (factChecks.length > 0) {
      const topResult = factChecks[0];
      const claimReview = topResult.claimReview[0];

      let rating = 'questionable';
      let color = 'yellow';
      let confidence = 50;

      const ratingText = (claimReview.textualRating || '').toLowerCase();

      if (
        ratingText.includes('true') ||
        ratingText.includes('correct') ||
        ratingText.includes('accurate') ||
        ratingText.includes('mostly true')
      ) {
        rating = 'verified';
        color = 'green';
        confidence = 85;
      } else if (
        ratingText.includes('false') ||
        ratingText.includes('incorrect') ||
        ratingText.includes('debunked') ||
        ratingText.includes('pants on fire')
      ) {
        rating = 'false';
        color = 'red';
        confidence = 90;
      } else if (
        ratingText.includes('misleading') ||
        ratingText.includes('partly') ||
        ratingText.includes('mixed') ||
        ratingText.includes('unproven')
      ) {
        rating = 'questionable';
        color = 'yellow';
        confidence = 70;
      }

      return res.json({
        verified: true,
        rating,
        color,
        confidence,
        reason: claimReview.textualRating,
        claim: topResult.text,
        claimant: topResult.claimant || 'Unknown',
        sources: [
          {
            name: claimReview.publisher.name,
            url: claimReview.url,
            title: claimReview.title
          }
        ],
        reviewDate: claimReview.reviewDate
      });
    }

    // 2) Fallback to Claude
    if (!CLAUDE_API_KEY) {
      return res.json({
        verified: false,
        rating: 'unknown',
        reason: 'No fact-checks found and AI key not configured on server.',
        confidence: 0,
        sources: [],
        claim
      });
    }

    const claudeResp = await fetch(CLAUDE_MESSAGES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 256,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'You are a careful fact-checking assistant. ' +
                  'You will be given a single claim. ' +
                  'Estimate how likely it is that the claim is factually true RIGHT NOW, ' +
                  'based on reliable public knowledge. ' +
                  'Return a single JSON object with exactly these fields: ' +
                  '{ "rating": "verified|questionable|false", "confidence": <0-100 integer>, "explanation": "<short explanation>" }. ' +
                  'rating = "verified" if the claim is very likely true, ' +
                  '"false" if it is very likely false, ' +
                  'and "questionable" if there is mixed, weak, or insufficient evidence. ' +
                  'confidence is your best guess at P(claim is true) * 100 and must be between 0 and 100. ' +
                  'Do not include any extra text, only valid JSON.\n\n' +
                  `Claim: ${claim}`
              }
            ]
          }
        ]
      })
    });

    if (!claudeResp.ok) {
      console.error('Claude API error', claudeResp.status, claudeResp.statusText);
      return res.json({
        verified: false,
        rating: 'unknown',
        reason: 'No fact-checks found and AI request failed.',
        confidence: 0,
        sources: [],
        claim
      });
    }

    const claudeData = await claudeResp.json();
    const contentBlocks = claudeData?.content || [];
    const textBlock = contentBlocks.find((b) => b.type === 'text');
    const rawText = textBlock?.text || '';

    const parsed = parseClaudeJsonObject(rawText);
    if (!parsed) {
      console.error('Failed to parse Claude JSON', rawText);
      return res.json({
        verified: false,
        rating: 'unknown',
        reason: 'AI response could not be parsed.',
        confidence: 0,
        sources: [],
        claim
      });
    }

    const rating =
      parsed.rating === 'verified' || parsed.rating === 'false' || parsed.rating === 'questionable'
        ? parsed.rating
        : 'questionable';

    let confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 50;
    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    let color = 'yellow';
    if (rating === 'verified') color = 'green';
    if (rating === 'false') color = 'red';

    return res.json({
      verified: true,
      rating,
      color,
      confidence,
      reason: parsed.explanation || 'AI-generated estimate based on public information.',
      claim,
      claimant: 'Unknown',
      sources: [],
      reviewDate: new Date().toISOString()
    });
  } catch (err) {
    console.error('verify-claim error', err);
    return res.status(500).json({
      verified: false,
      rating: 'error',
      reason: 'Verification failed on server.',
      confidence: 0,
      sources: [],
      claim
    });
  }
});

app.listen(PORT, () => {
  console.log(`Verity backend listening on http://localhost:${PORT}`);
});

