// Main content script - Domain Trust Scoring + Auto Claim Verification

let currentDomainScore = null;
let trustBadge = null;
let verificationModal = null;
let apiClaimResults = [];

// Initialize when page loads
async function init() {
  console.log('Verity: Initializing Domain Trust Scanner');
  
  // Analyze current domain
  const url = window.location.href;
  currentDomainScore = await analyzeDomain(url);
  
  console.log('Domain Score (base):', currentDomainScore);
  
  // Try to verify claims from page
  await checkPageClaims();
  
  // Show trust badge (with claim results if found)
  showTrustBadge(currentDomainScore, apiClaimResults);
  
  // Update extension badge
  updateExtensionBadge(currentDomainScore);
  
  // Store result for popup
  chrome.storage.local.set({
    currentDomain: currentDomainScore,
    claimResults: apiClaimResults
  });
  
  // Show notification
  showNotification(currentDomainScore, apiClaimResults);
  
  // Save to history
  saveToHistory(currentDomainScore);
}

// Check claims on page automatically
async function checkPageClaims() {
  console.log('🔍 Scanning page for claims...');
  
  try {
    // Extract potential claims
    const claims = extractClaimsFromPage();
    
    if (claims.length === 0) {
      console.log('ℹ️ No claims extracted from page');
      return;
    }
    
    // Check each claim with API (max 3)
    const claimsToCheck = claims.slice(0, 3);
    apiClaimResults = [];
    
    for (const claim of claimsToCheck) {
      console.log(`🔎 Checking: "${claim.text.substring(0, 60)}..."`);
      
      const result = await verifyClaim(claim.text);
      
      if (result.verified && result.rating !== 'unknown') {
        console.log(`✅ Found fact-check: ${result.rating}`);
        apiClaimResults.push(result);
        
        // Stop after finding 1 verified claim (to avoid too many API calls)
        break;
      } else {
        console.log(`ℹ️ No fact-check found for this claim`);
      }
    }
    
    // Adjust domain score based on claim results
    if (apiClaimResults.length > 0) {
      adjustScoreBasedOnClaims();
    } else {
      console.log('ℹ️ No verified claims found - using domain score only');
    }
    
  } catch (error) {
    console.error('❌ Claim verification error:', error);
  }
}

// Adjust domain score based on verified claims
function adjustScoreBasedOnClaims() {
  if (apiClaimResults.length === 0) return;
  
  const firstClaim = apiClaimResults[0];
  
  console.log('📊 Adjusting score based on claim verification...');
  console.log('Original score:', currentDomainScore.score);
  console.log('Claim rating:', firstClaim.rating);
  
  // Adjust score based on claim rating
  if (firstClaim.rating === 'verified') {
    // Verified claim → slight boost
    currentDomainScore.score = Math.min(100, currentDomainScore.score + 5);
    currentDomainScore.reason += ' | Contains verified claims';
    currentDomainScore.apiVerified = true;
  } else if (firstClaim.rating === 'false') {
    // False claim → significant penalty
    currentDomainScore.score = Math.max(0, currentDomainScore.score - 20);
    currentDomainScore.reason = 'Contains false/debunked claims';
    currentDomainScore.color = 'red';
    currentDomainScore.status = 'untrusted';
    currentDomainScore.apiVerified = true;
  } else if (firstClaim.rating === 'questionable') {
    // Questionable claim → moderate penalty
    currentDomainScore.score = Math.max(0, currentDomainScore.score - 10);
    currentDomainScore.reason += ' | Contains questionable claims';
    currentDomainScore.apiVerified = true;
  }
  
  console.log('Adjusted score:', currentDomainScore.score);
}

// Show trust badge on page
function showTrustBadge(scoreData, claimResults = []) {
  // Remove existing badge
  if (trustBadge && document.body.contains(trustBadge)) {
    trustBadge.remove();
  }
  
  // Build claim info section
  let claimInfoHTML = '';
  if (claimResults.length > 0) {
    const claim = claimResults[0];
    const ratingClass = claim.rating === 'verified' ? 'verified' : 
                       claim.rating === 'false' ? 'false' : 'questionable';
    const ratingIcon = claim.rating === 'verified' ? '✓' : 
                      claim.rating === 'false' ? '✕' : '⚠';
    
    claimInfoHTML = `
      <div class="claim-verification">
        <div class="claim-header ${ratingClass}">
          <span class="claim-icon">${ratingIcon}</span>
          <span class="claim-status">${claim.rating.toUpperCase()}</span>
        </div>
        <div class="claim-text">"${truncateText(claim.claim, 80)}"</div>
        <div class="claim-source">— ${claim.sources[0]?.name || 'Fact-checker'}</div>
      </div>
    `;
  }
  
  // Create badge
  trustBadge = document.createElement('div');
  trustBadge.className = 'verity-trust-badge';
  trustBadge.innerHTML = `
    <div class="trust-badge-header">
      <div class="trust-badge-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>Verity</span>
      </div>
      <button class="trust-badge-close" id="closeTrustBadge">×</button>
    </div>
    <div class="trust-badge-body">
      <div class="trust-score-circle ${getScoreColorClass(scoreData.score)}">
        <span class="score-value">${scoreData.score}</span>
        <span class="score-max">/100</span>
      </div>
      <div class="trust-info">
        <div class="trust-domain">${scoreData.domain}</div>
        <div class="trust-status ${scoreData.color}">${getStatusText(scoreData.score)}</div>
        <div class="trust-category">${scoreData.category}</div>
      </div>
    </div>
    ${claimInfoHTML}
    <div class="trust-badge-footer">
      <div class="trust-reason">${scoreData.reason}</div>
      ${scoreData.hasHttps ? '<div class="trust-feature">🔒 Secure HTTPS</div>' : '<div class="trust-warning">⚠️ Not using HTTPS</div>'}
      ${scoreData.apiVerified ? '<div class="trust-feature">✓ API Verified</div>' : ''}
      <div class="trust-tip">💡 Select text + Ctrl+Shift+V to verify claims</div>
    </div>
  `;
  
  document.body.appendChild(trustBadge);
  
  // Add close handler
  setTimeout(() => {
    const closeBtn = document.getElementById('closeTrustBadge');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        trustBadge.classList.add('hidden');
      });
    }
  }, 100);
  
  // Show badge with animation
  setTimeout(() => {
    trustBadge.classList.add('show');
  }, 500);
  
  // Auto-hide after 15 seconds (longer if claims found)
  setTimeout(() => {
    if (trustBadge && document.body.contains(trustBadge)) {
      trustBadge.classList.remove('show');
    }
  }, claimResults.length > 0 ? 20000 : 12000);
}

// Show notification
function showNotification(scoreData, claimResults = []) {
  const notification = document.createElement('div');
  notification.className = 'verity-notification';
  
  let message = '';
  
  if (claimResults.length > 0 && claimResults[0].rating === 'false') {
    message = `⚠️ WARNING: False claim detected on ${scoreData.domain}`;
  } else if (claimResults.length > 0 && claimResults[0].rating === 'verified') {
    message = `✓ Verified claim found on ${scoreData.domain}`;
  } else if (scoreData.score >= 80) {
    message = `✓ Trusted source - ${scoreData.domain}`;
  } else if (scoreData.score >= 50) {
    message = `⚠ Exercise caution - ${scoreData.domain}`;
  } else {
    message = `⚠ High risk source - ${scoreData.domain}`;
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Update extension badge
function updateExtensionBadge(scoreData) {
  let color = '#757575';
  let text = scoreData.score.toString();
  
  if (scoreData.score >= 80) {
    color = '#00C853';
  } else if (scoreData.score >= 50) {
    color = '#FFB300';
  } else {
    color = '#FF3D00';
  }
  
  chrome.runtime.sendMessage({
    action: 'updateBadge',
    text: text,
    color: color
  });
}

// Get score color class
function getScoreColorClass(score) {
  if (score >= 80) return 'trust-high';
  if (score >= 50) return 'trust-medium';
  return 'trust-low';
}

// Get status text
function getStatusText(score) {
  if (score >= 80) return 'Highly Trusted';
  if (score >= 65) return 'Generally Trusted';
  if (score >= 50) return 'Use Caution';
  if (score >= 30) return 'Low Trust';
  return 'High Risk';
}

// Truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ============================================
// MANUAL CLAIM VERIFICATION (Ctrl+Shift+V)
// ============================================

// Verify selected text
async function verifySelectedText(text) {
  if (!text) {
    text = window.getSelection().toString().trim();
  }
  
  if (!text) {
    showQuickNotification('⚠️ Please select some text to verify', 'warning');
    return;
  }
  
  if (text.length < 10) {
    showQuickNotification('⚠️ Selected text is too short (minimum 10 characters)', 'warning');
    return;
  }
  
  if (text.length > 500) {
    text = text.substring(0, 500);
    showQuickNotification('ℹ️ Text truncated to 500 characters', 'info');
  }
  
  // Show loading modal
  showVerificationModal({ loading: true, claim: text });
  
  console.log('🔍 Verifying claim:', text);
  
  try {
    const result = await verifyClaim(text);
    console.log('📊 Verification Result:', result);
    showVerificationModal(result);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    showVerificationModal({
      verified: false,
      rating: 'error',
      reason: 'Verification failed. Please try again.',
      claim: text
    });
  }
}

// Show verification modal with API results
function showVerificationModal(result) {
  if (verificationModal && document.body.contains(verificationModal)) {
    verificationModal.remove();
  }
  
  verificationModal = document.createElement('div');
  verificationModal.className = 'verity-verification-modal';
  
  if (result.loading) {
    verificationModal.innerHTML = `
      <div class="verification-overlay"></div>
      <div class="verification-content loading">
        <div class="verification-header">
          <h2>Verifying Claim...</h2>
        </div>
        <div class="verification-body">
          <div class="loading-spinner"></div>
          <p class="loading-text">Searching fact-check database...</p>
          <div class="claim-preview">"${truncateText(result.claim, 150)}"</div>
        </div>
      </div>
    `;
  } else {
    const ratingClass = result.rating || 'unknown';
    const ratingIcon = getRatingIcon(result.rating);
    const ratingLabel = getRatingLabel(result.rating);
    const confidencePercent = result.confidence || 0;
    
    verificationModal.innerHTML = `
      <div class="verification-overlay"></div>
      <div class="verification-content ${ratingClass}">
        <button class="verification-close" id="closeVerificationModal">×</button>
        
        <div class="verification-header">
          <div class="rating-badge ${ratingClass}">
            <span class="rating-icon">${ratingIcon}</span>
            <span class="rating-label">${ratingLabel}</span>
          </div>
          ${result.verified ? `
            <div class="confidence-bar">
              <div class="confidence-label">Confidence: ${confidencePercent}%</div>
              <div class="confidence-track">
                <div class="confidence-fill ${ratingClass}" style="width: ${confidencePercent}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="verification-body">
          <div class="claim-section">
            <h3>Claim Checked:</h3>
            <p class="claim-text">"${result.claim}"</p>
            ${result.claimant ? `<p class="claimant">— ${result.claimant}</p>` : ''}
          </div>
          
          ${result.verified ? `
            <div class="verdict-section">
              <h3>Verdict:</h3>
              <p class="verdict-text">${result.reason}</p>
              ${result.reviewDate ? `<p class="review-date">Reviewed: ${formatDate(result.reviewDate)}</p>` : ''}
            </div>
            
            ${result.sources && result.sources.length > 0 ? `
              <div class="sources-section">
                <h3>Fact-Checked By:</h3>
                ${result.sources.map(source => `
                  <div class="source-item">
                    <a href="${source.url}" target="_blank" class="source-link">
                      <div class="source-icon">🔗</div>
                      <div class="source-info">
                        <div class="source-name">${source.name}</div>
                        <div class="source-title">${truncateText(source.title, 80)}</div>
                      </div>
                      <div class="source-arrow">→</div>
                    </a>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          ` : `
            <div class="no-results-section">
              <div class="no-results-icon">🔍</div>
              <h3>No Fact-Checks Found</h3>
              <p>This claim hasn't been fact-checked by our sources yet.</p>
              <p class="tip">This doesn't mean it's false - just that it's not in our database.</p>
            </div>
          `}
        </div>
        
        <div class="verification-footer">
          <p class="disclaimer">
            ${result.verified 
              ? 'Fact-check powered by Google Fact Check Tools API' 
              : 'Try verifying a well-known claim or statement'}
          </p>
        </div>
      </div>
    `;
  }
  
  document.body.appendChild(verificationModal);
  setTimeout(() => verificationModal.classList.add('show'), 10);
  
  if (!result.loading) {
    const closeBtn = verificationModal.querySelector('#closeVerificationModal');
    const overlay = verificationModal.querySelector('.verification-overlay');
    
    const closeModal = () => {
      verificationModal.classList.remove('show');
      setTimeout(() => verificationModal.remove(), 300);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
}

// Helper functions for modal
function getRatingIcon(rating) {
  const icons = {
    'verified': '✓',
    'questionable': '⚠',
    'false': '✕',
    'unknown': '?',
    'error': '⚠'
  };
  return icons[rating] || '?';
}

function getRatingLabel(rating) {
  const labels = {
    'verified': 'Verified',
    'questionable': 'Questionable',
    'false': 'False',
    'unknown': 'Not Found',
    'error': 'Error'
  };
  return labels[rating] || 'Unknown';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function showQuickNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `verity-quick-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Save to history
function saveToHistory(scoreData) {
  chrome.storage.local.get(['visitHistory'], (data) => {
    let history = data.visitHistory || [];
    
    const entry = {
      domain: scoreData.domain,
      score: scoreData.score,
      category: scoreData.category,
      reason: scoreData.reason,
      visitedAt: new Date().toISOString(),
      url: window.location.href,
      apiVerified: scoreData.apiVerified || false
    };
    
    const recentVisit = history.find(
      h => h.domain === entry.domain && 
      (new Date() - new Date(h.visitedAt)) < 3600000
    );
    
    if (!recentVisit) {
      history.unshift(entry);
      if (history.length > 100) {
        history = history.slice(0, 100);
      }
      chrome.storage.local.set({ visitHistory: history });
      console.log('✅ Saved to history:', entry.domain);
    }
  });
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDomainScore') {
    sendResponse({ score: currentDomainScore });
  }
  
  if (request.action === 'rescanDomain') {
    init();
    sendResponse({ status: 'rescanning' });
  }
  
  if (request.action === 'verifySelection') {
    verifySelectedText(request.text);
    sendResponse({ status: 'verifying' });
  }
  
  return true;
});

// Bridge: allow the Verity website to request history stored by the extension.
// This does NOT run any scanning logic; it only returns cached `visitHistory`.
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.origin !== window.location.origin) return;

  const data = event.data;
  if (!data || typeof data !== 'object') return;
  if (data.type !== 'VERITY_HISTORY_REQUEST' || data.source !== 'verity-frontend') return;

  chrome.storage.local.get(['visitHistory'], (result) => {
    const history = Array.isArray(result?.visitHistory) ? result.visitHistory : [];
    window.postMessage(
      {
        type: 'VERITY_HISTORY_RESPONSE',
        source: 'verity-extension',
        requestId: data.requestId,
        payload: history
      },
      event.origin
    );
  });
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}