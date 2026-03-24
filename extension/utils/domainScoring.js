// Domain Trust Scoring System
// Analyzes domains and provides trust scores (0-100)

// =============================================
// HARDCODED DOMAIN DATABASE
// =============================================

const TRUSTED_DOMAINS = {
  // News - High Trust (80-95)
  'bbc.com': { score: 92, category: 'news', reason: 'Established news organization with editorial standards' },
  'bbc.co.uk': { score: 92, category: 'news', reason: 'Established news organization with editorial standards' },
  'reuters.com': { score: 90, category: 'news', reason: 'International news agency with fact-checking' },
  'apnews.com': { score: 91, category: 'news', reason: 'Associated Press - non-profit news cooperative' },
  'npr.org': { score: 88, category: 'news', reason: 'Public radio with editorial standards' },
  'theguardian.com': { score: 85, category: 'news', reason: 'Independent news with fact-checking' },
  'nytimes.com': { score: 85, category: 'news', reason: 'Established newspaper with corrections policy' },
  'washingtonpost.com': { score: 84, category: 'news', reason: 'Major newspaper with fact-checking' },
  'wsj.com': { score: 86, category: 'news', reason: 'Financial news with editorial oversight' },
  
  // Academic & Reference (85-95)
  'wikipedia.org': { score: 85, category: 'reference', reason: 'Crowdsourced encyclopedia with citations' },
  'britannica.com': { score: 90, category: 'reference', reason: 'Established encyclopedia with expert editors' },
  'nature.com': { score: 95, category: 'academic', reason: 'Peer-reviewed scientific journal' },
  'sciencedirect.com': { score: 94, category: 'academic', reason: 'Academic database with peer review' },
  'pubmed.ncbi.nlm.nih.gov': { score: 95, category: 'academic', reason: 'US National Library of Medicine database' },
  'scholar.google.com': { score: 88, category: 'academic', reason: 'Academic search engine' },
  
  // Government (90-98)
  'gov.uk': { score: 95, category: 'government', reason: 'UK government official site' },
  'cdc.gov': { score: 96, category: 'government', reason: 'US Centers for Disease Control' },
  'who.int': { score: 94, category: 'government', reason: 'World Health Organization' },
  'nih.gov': { score: 95, category: 'government', reason: 'US National Institutes of Health' },
  'fda.gov': { score: 94, category: 'government', reason: 'US Food and Drug Administration' },
  
  // Fact Checkers (88-95)
  'snopes.com': { score: 90, category: 'fact-check', reason: 'Independent fact-checking organization' },
  'factcheck.org': { score: 92, category: 'fact-check', reason: 'Non-partisan fact-checking' },
  'politifact.com': { score: 88, category: 'fact-check', reason: 'Political fact-checking with Truth-O-Meter' },
  'fullfact.org': { score: 90, category: 'fact-check', reason: 'UK independent fact-checking charity' },
  
  // Tech & E-commerce (70-85)
  'amazon.com': { score: 75, category: 'ecommerce', reason: 'Major retailer - verify product claims independently' },
  'ebay.com': { score: 70, category: 'ecommerce', reason: 'Marketplace - seller reliability varies' },
  'google.com': { score: 85, category: 'tech', reason: 'Major tech company' },
  'microsoft.com': { score: 85, category: 'tech', reason: 'Established tech company' },

  // Major platforms & professional (user-generated content — still verify claims)
  'linkedin.com': { score: 78, category: 'professional', reason: 'Established professional network; treat posts and ads as user content' },
  'github.com': { score: 82, category: 'tech', reason: 'Major developer platform; repo content varies by publisher' },
  'stackoverflow.com': { score: 84, category: 'reference', reason: 'Community Q&A with moderation; check dates and accepted answers' },
  'reddit.com': { score: 62, category: 'social', reason: 'User-driven discussions — verify claims independently' },
  'x.com': { score: 65, category: 'social', reason: 'Social posts are user content, not editorial' },
  'twitter.com': { score: 65, category: 'social', reason: 'Social posts are user content, not editorial' },
};

const UNTRUSTED_DOMAINS = {
  // Known Misinformation Sites (10-30)
  'naturalnews.com': { score: 15, category: 'questionable', reason: 'Known for conspiracy theories and pseudoscience' },
  'infowars.com': { score: 10, category: 'questionable', reason: 'Conspiracy theories and misinformation' },
  'beforeitsnews.com': { score: 20, category: 'questionable', reason: 'User-generated content without verification' },
  'yournewswire.com': { score: 12, category: 'questionable', reason: 'Fake news and hoaxes' },
  'newspunch.com': { score: 12, category: 'questionable', reason: 'Formerly YourNewsWire, known for fake news' },
  'worldnewsdailyreport.com': { score: 5, category: 'satire/fake', reason: 'Satirical fake news site' },
  
  // Clickbait & Low Quality (25-40)
  'buzzfeed.com': { score: 55, category: 'entertainment', reason: 'Mix of entertainment and news - verify claims' },
  'dailymail.co.uk': { score: 45, category: 'tabloid', reason: 'Tabloid with sensationalized content' },
};

// =============================================
// DOMAIN ANALYSIS FUNCTIONS
// =============================================

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    
    // Remove www. prefix
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

/**
 * Get domain score from our database
 */
function getDomainScore(domain) {
  // Check trusted domains
  if (TRUSTED_DOMAINS[domain]) {
    return {
      score: TRUSTED_DOMAINS[domain].score,
      category: TRUSTED_DOMAINS[domain].category,
      reason: TRUSTED_DOMAINS[domain].reason,
      status: 'trusted',
      color: 'green'
    };
  }
  
  // Check untrusted domains
  if (UNTRUSTED_DOMAINS[domain]) {
    return {
      score: UNTRUSTED_DOMAINS[domain].score,
      category: UNTRUSTED_DOMAINS[domain].category,
      reason: UNTRUSTED_DOMAINS[domain].reason,
      status: 'untrusted',
      color: 'red'
    };
  }
  
  // Unknown domain - neutral score
  return {
    score: 50,
    category: 'unknown',
    reason: 'Domain not in our database - exercise caution',
    status: 'neutral',
    color: 'yellow'
  };
}

/**
 * Analyze domain with multiple factors
 */
async function analyzeDomain(url) {
  const domain = extractDomain(url);
  
  if (!domain) {
    return {
      score: 0,
      category: 'error',
      reason: 'Invalid URL',
      status: 'error',
      color: 'gray'
    };
  }
  
  // Get base score from database
  let result = getDomainScore(domain);
  
  // Check if HTTPS (small bonus)
  if (url.startsWith('https://')) {
    result.score = Math.min(100, result.score + 2);
    result.hasHttps = true;
  } else {
    result.score = Math.max(0, result.score - 5);
    result.hasHttps = false;
  }
  
  // Check Google Safe Browsing (if enabled)
  try {
    const isSafe = await checkGoogleSafeBrowsing(url);
    if (!isSafe) {
      result.score = Math.max(0, result.score - 30);
      result.safeBrowsingWarning = true;
      result.reason += ' | ⚠️ Flagged by Google Safe Browsing';
    }
  } catch (error) {
    console.log('Safe Browsing check failed:', error);
  }
  
  // Determine final color based on score
  if (result.score >= 80) {
    result.color = 'green';
    result.status = 'trusted';
  } else if (result.score >= 50) {
    result.color = 'yellow';
    result.status = 'neutral';
  } else {
    result.color = 'red';
    result.status = 'untrusted';
  }
  
  result.domain = domain;
  result.url = url;
  result.analyzedAt = new Date().toISOString();
  
  return result;
}

/**
 * Check Google Safe Browsing API
 * Note: Requires API key - using mock for now
 */
async function checkGoogleSafeBrowsing(url) {
  // TODO: Get Google Safe Browsing API key from settings
  // For now, return true (safe) for all
  
  try {
    // const apiKey = await getApiKey();
    // if (!apiKey) return true;
    
    // const response = await fetch(
    //   `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
    //   {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       client: {
    //         clientId: 'verity-extension',
    //         clientVersion: '1.0.0'
    //       },
    //       threatInfo: {
    //         threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
    //         platformTypes: ['ANY_PLATFORM'],
    //         threatEntryTypes: ['URL'],
    //         threatEntries: [{ url: url }]
    //       }
    //     })
    //   }
    // );
    
    // const data = await response.json();
    // return !data.matches || data.matches.length === 0;
    
    return true; // Safe by default
  } catch (error) {
    console.error('Safe Browsing API error:', error);
    return true; // Assume safe on error
  }
}

/**
 * Get color class for score
 */
function getScoreColorClass(score) {
  if (score >= 80) return 'trust-high';
  if (score >= 50) return 'trust-medium';
  return 'trust-low';
}

/**
 * Get status text for score
 */
function getStatusText(score) {
  if (score >= 80) return 'Highly Trusted';
  if (score >= 65) return 'Generally Trusted';
  if (score >= 50) return 'Use Caution';
  if (score >= 30) return 'Low Trust';
  return 'High Risk';
}