// API Configuration for Verity
// Google Fact Check Tools API Integration

const FACT_CHECK_ENDPOINT = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
const FACT_CHECK_MAX_RESULTS = 5;

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
 * Search for fact-checked claims using Google Fact Check API
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
 * Verify a specific claim
 */
async function verifyClaim(claimText) {
  const factChecks = await searchFactChecks(claimText);
  
  if (!factChecks || factChecks.length === 0) {
    return {
      verified: false,
      rating: 'unknown',
      reason: 'No fact-checks found in database',
      confidence: 0,
      sources: [],
      claim: claimText
    };
  }
  
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
    rating: rating,
    color: color,
    confidence: confidence,
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

console.log('✅ Verity API Config loaded - Fact Check API (key stored in settings)');