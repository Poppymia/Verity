// Simple Claim Extraction
// Looks for factual-sounding sentences on the page

/**
 * Extract potential claims from page text
 */
function extractClaimsFromPage() {
  // Get main content (avoid navigation, ads, etc.)
  const mainContent = getMainContent();
  
  if (!mainContent) {
    console.log('No main content found');
    return [];
  }
  
  // Get all text
  const text = mainContent.innerText || mainContent.textContent;
  
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // Filter for potential claims
  const claims = [];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    
    // Skip if too short or too long
    if (trimmed.length < 20 || trimmed.length > 300) continue;
    
    // Look for claim indicators
    const hasClaimIndicators = 
      /\d+%/.test(trimmed) ||                    // Percentages: "90% of..."
      /\d+\s*(times|fold|percent)/.test(trimmed) || // Multiples: "5 times more"
      /study|research|shows?|found|proves?/i.test(trimmed) || // Study references
      /scientists?|experts?|doctors?/i.test(trimmed) || // Authority claims
      /causes?|prevents?|cures?/i.test(trimmed) || // Causal claims
      /"[^"]+"/.test(trimmed);                   // Quotes
    
    if (hasClaimIndicators) {
      claims.push({
        text: trimmed,
        confidence: 60
      });
    }
    
    // Stop after finding 3 claims
    if (claims.length >= 3) break;
  }
  
  console.log(`📝 Extracted ${claims.length} potential claims`);
  return claims;
}

/**
 * Get main content area of page
 */
function getMainContent() {
  // Try to find main content area
  const selectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '.content',
    '#content',
    '.post-content',
    '.article-content'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  
  // Fallback to body
  return document.body;
}

console.log('✅ Claim Extractor loaded');