// API communication utilities

const API_CONFIG = {
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  retryAttempts: 3
};

// Make API request with retry logic
async function makeAPIRequest(endpoint, options = {}) {
  const settings = await getSettings();
  const url = `${settings.apiEndpoint || API_CONFIG.baseURL}${endpoint}`;
  
  for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`Verity: API request failed (attempt ${attempt}/${API_CONFIG.retryAttempts})`, error);
      
      if (attempt === API_CONFIG.retryAttempts) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Batch verify multiple claims
async function batchVerifyClaims(claims) {
  try {
    return await makeAPIRequest('/api/batch-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claims })
    });
  } catch (error) {
    console.error('Batch verification failed', error);
    // Return mock data
    return claims.map(claim => getMockVerification(claim));
  }
}

// Get statistics for current domain
async function getDomainStats(domain) {
  try {
    return await makeAPIRequest(`/api/stats/${domain}`);
  } catch (error) {
    console.error('Failed to get domain stats', error);
    return null;
  }
}

// Report false positive/negative
async function reportVerification(claimId, isCorrect, userFeedback) {
  try {
    return await makeAPIRequest('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claimId,
        isCorrect,
        feedback: userFeedback
      })
    });
  } catch (error) {
    console.error('Failed to report verification', error);
    return null;
  }
}