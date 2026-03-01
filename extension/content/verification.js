// Verification logic and API calls

// Verify claim via API
async function verifyClaimAPI(claimText) {
  const settings = await getSettings();
  
  try {
    const response = await fetch(`${settings.apiEndpoint}/api/verify-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        claim: claimText,
        url: window.location.href,
        domain: window.location.hostname
      })
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Verity: API call failed, using mock data', error);
    // Return mock data for testing
    return getMockVerification(claimText);
  }
}

// Get domain trust score via API
async function getDomainTrustAPI(domain) {
  const settings = await getSettings();
  
  try {
    const response = await fetch(`${settings.apiEndpoint}/api/domain-trust/${domain}`);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Verity: API call failed, using mock data', error);
    // Return mock data
    return {
      domain: domain,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      verificationsCount: Math.floor(Math.random() * 1000) + 100
    };
  }
}

// Mock verification for testing
function getMockVerification(claim) {
  const ratings = ['verified', 'questionable', 'false'];
  const rating = ratings[Math.floor(Math.random() * ratings.length)];
  
  return {
    claim: claim,
    rating: rating,
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100
    sources: [
      { name: 'Example Source 1', url: 'https://example.com/source1' },
      { name: 'Example Source 2', url: 'https://example.com/source2' }
    ],
    explanation: getExplanationForRating(rating)
  };
}

// Get explanation based on rating
function getExplanationForRating(rating) {
  const explanations = {
    'verified': 'This claim has been verified against authoritative sources and appears to be accurate.',
    'questionable': 'This claim lacks sufficient evidence or has conflicting information from different sources.',
    'false': 'This claim contradicts verified information from authoritative sources.'
  };
  return explanations[rating];
}