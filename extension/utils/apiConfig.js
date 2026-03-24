// API Configuration for Verity
// Google Fact Check Tools API (primary) + Claude AI fallback

const FACT_CHECK_ENDPOINT = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
const FACT_CHECK_MAX_RESULTS = 5;

const CLAUDE_MESSAGES_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5';

/**
 * Load the Fact Check API key from extension settings (stored only in the browser).
 */
function getFactCheckApiKey() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
      resolve('');
      return;
    }

    chrome.storage.sync.get(
      {
        factCheckApiKey: ''
      },
      (items) => {
        resolve(items.factCheckApiKey || '');
      }
    );
  });
}

/**
 * Load the Claude API key from extension settings (stored only in the browser).
 */
function getClaudeApiKey() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
      resolve('');
      return;
    }

    chrome.storage.sync.get(
      {
        claudeApiKey: ''
      },
      (items) => {
        resolve(items.claudeApiKey || '');
      }
    );
  });
}

/**
 * Search for fact-checked claims using Google Fact Check API
 * (primary data source, considered "our API" in this extension).
 */
async function searchFactChecks(query) {
  const apiKey = await getFactCheckApiKey();

  if (!apiKey) {
    console.log('❌ Fact Check API key not configured. Set it in Verity Settings.');
    return null;
  }
  
  try {
    const url = `${FACT_CHECK_ENDPOINT}?query=${encodeURIComponent(query)}&key=${apiKey}&languageCode=en&maxResults=${FACT_CHECK_MAX_RESULTS}`;
    
    console.log('🔍 Searching fact checks for:', query);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.claims && data.claims.length > 0) {
      console.log('✅ Found', data.claims.length, 'fact checks');
      return data.claims;
    } else {
      console.log('ℹ️ No fact checks found for this claim');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Fact Check API error:', error);
    return null;
  }
}

/**
 * Ask Claude to estimate how likely a claim is to be true.
 * Returns a result compatible with the verification modal.
 */
async function verifyClaimWithClaude(claimText) {
  const apiKey = await getClaudeApiKey();

  if (!apiKey) {
    console.log('ℹ️ Claude API key not configured. Skipping AI fallback.');
    return null;
  }

  try {
    const response = await fetch(CLAUDE_MESSAGES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Required for direct browser-based Claude API calls.
        'anthropic-dangerous-direct-browser-access': 'true'
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
                  `Claim: ${claimText}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    // Claude responses with a messages API format. We expect a single text block.
    const contentBlocks = data?.content || [];
    const textBlock = contentBlocks.find((b) => b.type === 'text');
    const rawText = textBlock?.text || '';

    const parsed = parseClaudeJsonObject(rawText);
    if (!parsed) {
      console.error('Failed to parse Claude JSON response', rawText);
      return null;
    }

    const rating = parsed.rating === 'verified' || parsed.rating === 'false' || parsed.rating === 'questionable'
      ? parsed.rating
      : 'questionable';

    let confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 50;
    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    let color = 'yellow';
    if (rating === 'verified') color = 'green';
    if (rating === 'false') color = 'red';

    return {
      verified: true,
      rating,
      color,
      confidence,
      reason: parsed.explanation || 'AI-generated estimate based on public information.',
      claim: claimText,
      claimant: 'Unknown',
      sources: [],
      reviewDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Claude AI verification error:', error);
    return null;
  }
}

/**
 * Verify a specific claim:
 * 1) Try Google Fact Check API (our structured fact-check database)
 * 2) If nothing is found, fall back to Claude AI to estimate probability
 */
async function verifyClaim(claimText) {
  // 1) Structured fact-checks (database/API)
  const factChecks = await searchFactChecks(claimText);
  
  if (Array.isArray(factChecks) && factChecks.length > 0) {
    // Get the most relevant fact check
    const topResult = factChecks[0];
    const claimReview = topResult.claimReview[0];
    
    // Determine rating
    let rating = 'questionable';
    let color = 'yellow';
    let confidence = 50;
    
    const ratingText = (claimReview.textualRating || '').toLowerCase();
    
    // Check for true/verified
    if (ratingText.includes('true') || 
        ratingText.includes('correct') || 
        ratingText.includes('accurate') ||
        ratingText.includes('mostly true')) {
      rating = 'verified';
      color = 'green';
      confidence = 85;
    } 
    // Check for false
    else if (ratingText.includes('false') || 
             ratingText.includes('incorrect') || 
             ratingText.includes('debunked') ||
             ratingText.includes('pants on fire')) {
      rating = 'false';
      color = 'red';
      confidence = 90;
    } 
    // Questionable/Mixed
    else if (ratingText.includes('misleading') || 
             ratingText.includes('partly') ||
             ratingText.includes('mixed') ||
             ratingText.includes('unproven')) {
      rating = 'questionable';
      color = 'yellow';
      confidence = 70;
    }
    
    return {
      verified: true,
      rating,
      color,
      confidence,
      reason: claimReview.textualRating,
      claim: topResult.text,
      claimant: topResult.claimant || 'Unknown',
      sources: [{
        name: claimReview.publisher.name,
        url: claimReview.url,
        title: claimReview.title
      }],
      reviewDate: claimReview.reviewDate
    };
  }

  // 2) AI fallback (Claude) if API has no info
  const aiResult = await verifyClaimWithClaude(claimText);
  if (aiResult) {
    return aiResult;
  }
  
  // 3) Final fallback: unknown
  return {
    verified: false,
    rating: 'unknown',
    reason: 'No fact-checks found and AI fallback unavailable.',
    confidence: 0,
    sources: [],
    claim: claimText
  };
}

/**
 * Analyze a page + domain with Claude and return a trust score (0-100).
 * Returns null if Claude key is missing or request fails.
 */
async function analyzePageTrustWithClaude({ url, domain, pageText }) {
  const apiKey = await getClaudeApiKey();

  if (!apiKey) {
    console.log('ℹ️ Claude API key not configured. Skipping AI trust analysis.');
    return null;
  }

  const safeText = (pageText || '').slice(0, 6000);

  try {
    const response = await fetch(CLAUDE_MESSAGES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Required for direct browser-based Claude API calls.
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 350,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'You are a web trust analyst. ' +
                  'Given a website URL, domain, and page excerpt, estimate how trustworthy the page is. ' +
                  'Return only valid JSON with exactly these keys: ' +
                  '{ "score": <0-100 integer>, "category": "<one short label>", "reason": "<short reason <= 160 chars>", "confidence": <0-100 integer> }. ' +
                  'Score guidance: >=80 trusted, 50-79 caution, <50 high risk. ' +
                  'Do not include markdown, explanations, or extra keys.\n\n' +
                  `URL: ${url}\n` +
                  `Domain: ${domain}\n` +
                  `Page excerpt:\n${safeText}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Claude AI trust analysis error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const contentBlocks = data?.content || [];
    const textBlock = contentBlocks.find((b) => b.type === 'text');
    const rawText = textBlock?.text || '';

    const parsed = parseClaudeJsonObject(rawText);
    if (!parsed) {
      console.error('Failed to parse Claude trust JSON response', rawText);
      return null;
    }

    let score = typeof parsed.score === 'number' ? parsed.score : 50;
    score = Math.max(0, Math.min(100, Math.round(score)));

    let confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 50;
    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    const category = typeof parsed.category === 'string' && parsed.category.trim()
      ? parsed.category.trim()
      : 'ai-analysis';

    const reason = typeof parsed.reason === 'string' && parsed.reason.trim()
      ? parsed.reason.trim()
      : 'AI trust estimate based on domain and visible page content.';

    let color = 'yellow';
    let status = 'neutral';
    if (score >= 80) {
      color = 'green';
      status = 'trusted';
    } else if (score < 50) {
      color = 'red';
      status = 'untrusted';
    }

    return {
      score,
      category,
      reason,
      confidence,
      color,
      status,
      hasHttps: typeof url === 'string' ? url.startsWith('https://') : false,
      apiVerified: true,
      aiAnalyzed: true,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Claude trust analysis failed:', error);
    return null;
  }
}

console.log('✅ Verity API Config loaded - Fact Check API + Claude AI fallback (keys stored in settings)');