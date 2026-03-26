import request from 'supertest';
import { createApp } from '../../backend/app.js';

function makeResponse({ ok = true, status = 200, jsonData } = {}) {
  return {
    ok,
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    async json() {
      return jsonData;
    }
  };
}

describe('POST /api/verify-claim', () => {
  it('returns unknown when no API keys are configured', async () => {
    const app = createApp({
      fetchImpl: async () => {
        throw new Error('fetch should not be called when no API keys are set');
      },
      config: {
        googleFactCheckApiKey: '',
        claudeApiKey: ''
      }
    });

    const res = await request(app).post('/api/verify-claim').send({ claim: 'Some claim' });
    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(false);
    expect(res.body.rating).toBe('unknown');
    expect(res.body.confidence).toBe(0);
    expect(res.body.sources).toEqual([]);
  });

  it('parses Claude JSON output and returns a verified result', async () => {
    const fetchImpl = async (url) => {
      // Only Claude endpoint should be called in this test.
      if (!String(url).includes('api.anthropic.com')) {
        throw new Error(`Unexpected URL: ${url}`);
      }

      return makeResponse({
        ok: true,
        jsonData: {
          content: [
            {
              type: 'text',
              text: '```json\n{ "rating": "verified", "confidence": 85, "explanation": "Looks accurate" }\n```'
            }
          ]
        }
      });
    };

    const app = createApp({
      fetchImpl,
      config: {
        googleFactCheckApiKey: '',
        claudeApiKey: 'test-claude-key'
      }
    });

    const res = await request(app).post('/api/verify-claim').send({ claim: 'The sky is blue.' });
    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body.rating).toBe('verified');
    expect(res.body.color).toBe('green');
    expect(res.body.confidence).toBe(85);
    expect(res.body.reason).toBe('Looks accurate');
    expect(res.body.claim).toBe('The sky is blue.');
    expect(res.body.sources).toEqual([]);
    expect(typeof res.body.reviewDate).toBe('string');
  });

  it('returns unknown when Claude JSON cannot be parsed', async () => {
    const fetchImpl = async (url) => {
      if (!String(url).includes('api.anthropic.com')) {
        throw new Error(`Unexpected URL: ${url}`);
      }

      return makeResponse({
        ok: true,
        jsonData: {
          content: [
            {
              type: 'text',
              text: '```json\nNOT_JSON\n```'
            }
          ]
        }
      });
    };

    const app = createApp({
      fetchImpl,
      config: {
        googleFactCheckApiKey: '',
        claudeApiKey: 'test-claude-key'
      }
    });

    const res = await request(app).post('/api/verify-claim').send({ claim: 'A claim.' });
    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(false);
    expect(res.body.rating).toBe('unknown');
    expect(res.body.confidence).toBe(0);
    expect(res.body.sources).toEqual([]);
  });

  it('returns verified result from Google Fact Check response', async () => {
    const factCheckJson = {
      claims: [
        {
          text: 'Example claim text',
          claimant: 'Example claimant',
          claimReview: [
            {
              textualRating: 'True',
              publisher: { name: 'Example Publisher' },
              url: 'https://example.com/review',
              title: 'Example title',
              reviewDate: '2024-01-01'
            }
          ]
        }
      ]
    };

    const fetchImpl = async (url) => {
      if (String(url).includes('factchecktools.googleapis.com')) {
        return makeResponse({ ok: true, jsonData: factCheckJson });
      }
      throw new Error(`Unexpected URL: ${url}`);
    };

    const app = createApp({
      fetchImpl,
      config: {
        googleFactCheckApiKey: 'test-google-key',
        claudeApiKey: ''
      }
    });

    const res = await request(app).post('/api/verify-claim').send({ claim: 'Query text' });
    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body.rating).toBe('verified');
    expect(res.body.color).toBe('green');
    expect(res.body.confidence).toBe(85);
    expect(res.body.claim).toBe('Example claim text');
    expect(res.body.claimant).toBe('Example claimant');
    expect(res.body.sources[0].name).toBe('Example Publisher');
    expect(res.body.reviewDate).toBe('2024-01-01');
  });
});

