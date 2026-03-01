// Main content script - runs on every page

let settings = {};
let pageStats = {
  claimsDetected: 0,
  verified: 0,
  questionable: 0,
  false: 0
};

// Initialize extension
async function init() {
  console.log('Verity: Initializing on', window.location.hostname);
  
  // Load settings
  settings = await getSettings();
  
  // Show loading indicator
  showVerificationStatus('scanning');
  
  // Check for dark patterns
  if (settings.darkPatternDetection) {
    detectDarkPatterns();
  }
  
  // Get domain trust score
  if (settings.domainTrustScore) {
    await getDomainTrustScore();
  }
  
  // Auto-verify if enabled
  if (settings.autoVerify) {
    setTimeout(() => {
      scanAndVerifyClaims();
    }, settings.verificationDelay || 2000);
  }
}

// Get settings from storage
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      autoVerify: true,
      darkPatternDetection: true,
      domainTrustScore: true,
      apiEndpoint: 'http://localhost:5000',
      verificationDelay: 2000
    }, (items) => {
      resolve(items);
    });
  });
}

// Scan page for claims
function scanAndVerifyClaims() {
  console.log('Verity: Scanning for claims...');
  
  // Get all text content
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, span, div');
  
  textElements.forEach((element) => {
    // Skip if already processed
    if (element.hasAttribute('data-verity-processed')) return;
    
    const text = element.textContent.trim();
    
    // Skip short text
    if (text.length < 20) return;
    
    // Extract claims using NLP
    const claims = extractClaims(text);
    
    if (claims.length > 0) {
      claims.forEach((claim) => {
        verifyClaim(claim, element);
      });
    }
    
    element.setAttribute('data-verity-processed', 'true');
  });
  
  updateBadge();
  showVerificationStatus('complete');
}

// Verify a single claim
async function verifyClaim(claim, element) {
  pageStats.claimsDetected++;
  
  try {
    // Call verification API
    const result = await verifyClaimAPI(claim.text);
    
    // Highlight the claim
    highlightClaim(claim, result, element);
    
    // Update stats
    if (result.rating === 'verified') pageStats.verified++;
    else if (result.rating === 'questionable') pageStats.questionable++;
    else if (result.rating === 'false') pageStats.false++;
    
    updateBadge();
    
  } catch (error) {
    console.error('Verity: Verification failed', error);
  }
}

// Highlight claim in the page
function highlightClaim(claim, result, element) {
  const text = element.innerHTML;
  const claimText = claim.text;
  
  // Create highlight span
  const highlightClass = `verity-highlight-${result.rating}`;
  const highlightId = `verity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Replace text with highlighted version
  const highlighted = text.replace(
    claimText,
    `<span class="verity-highlight ${highlightClass}" 
          id="${highlightId}" 
          data-verity-rating="${result.rating}"
          data-verity-confidence="${result.confidence}"
          data-verity-sources="${JSON.stringify(result.sources).replace(/"/g, '&quot;')}"
          title="Click for details">${claimText}</span>`
  );
  
  element.innerHTML = highlighted;
  
  // Add click listener for tooltip
  const highlightElement = document.getElementById(highlightId);
  if (highlightElement) {
    highlightElement.addEventListener('click', () => {
      showVerificationTooltip(highlightElement, result);
    });
  }
}

// Show verification tooltip
function showVerificationTooltip(element, result) {
  // Remove existing tooltip
  const existing = document.querySelector('.verity-tooltip');
  if (existing) existing.remove();
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'verity-tooltip';
  tooltip.innerHTML = `
    <div class="verity-tooltip-header ${result.rating}">
      <span class="verity-tooltip-icon">${getRatingIcon(result.rating)}</span>
      <span class="verity-tooltip-title">${getRatingLabel(result.rating)}</span>
      <button class="verity-tooltip-close">×</button>
    </div>
    <div class="verity-tooltip-body">
      <p><strong>Claim:</strong> ${result.claim}</p>
      <p><strong>Confidence:</strong> ${result.confidence}%</p>
      <div class="verity-tooltip-sources">
        <strong>Sources:</strong>
        <ul>
          ${result.sources.map(s => `<li><a href="${s.url}" target="_blank">${s.name}</a></li>`).join('')}
        </ul>
      </div>
      ${result.explanation ? `<p class="verity-tooltip-explanation">${result.explanation}</p>` : ''}
    </div>
    <div class="verity-tooltip-footer">
      <a href="#" class="verity-learn-more">Learn More</a>
    </div>
  `;
  
  // Position tooltip
  const rect = element.getBoundingClientRect();
  tooltip.style.position = 'absolute';
  tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  
  document.body.appendChild(tooltip);
  
  // Close button
  tooltip.querySelector('.verity-tooltip-close').addEventListener('click', () => {
    tooltip.remove();
  });
  
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeTooltip(e) {
      if (!tooltip.contains(e.target) && e.target !== element) {
        tooltip.remove();
        document.removeEventListener('click', closeTooltip);
      }
    });
  }, 100);
}

// Get rating icon
function getRatingIcon(rating) {
  const icons = {
    'verified': '✓',
    'questionable': '⚠',
    'false': '✕'
  };
  return icons[rating] || '?';
}

// Get rating label
function getRatingLabel(rating) {
  const labels = {
    'verified': 'Verified',
    'questionable': 'Questionable',
    'false': 'False Claim'
  };
  return labels[rating] || 'Unknown';
}

// Update extension badge
function updateBadge() {
  const total = pageStats.verified + pageStats.questionable + pageStats.false;
  let color = '#0066FF';
  
  if (pageStats.false > 0) color = '#FF3D00';
  else if (pageStats.questionable > 0) color = '#FFB300';
  else if (pageStats.verified > 0) color = '#00C853';
  
  chrome.runtime.sendMessage({
    action: 'updateBadge',
    count: total,
    color: color
  });
}

// Show verification status
function showVerificationStatus(status) {
  let message = '';
  
  if (status === 'scanning') {
    message = 'Verity is scanning this page...';
  } else if (status === 'complete') {
    const total = pageStats.verified + pageStats.questionable + pageStats.false;
    message = `Verity found ${total} claim${total !== 1 ? 's' : ''}`;
  }
  
  // Create status notification
  const notification = document.createElement('div');
  notification.className = 'verity-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifySelection') {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      verifySelectedText(selection);
    }
  }
  return true;
});

// Verify selected text
async function verifySelectedText(text) {
  showVerificationStatus('verifying');
  
  try {
    const result = await verifyClaimAPI(text);
    
    // Show result in modal
    showVerificationModal(text, result);
    
  } catch (error) {
    console.error('Verity: Manual verification failed', error);
    showVerificationModal(text, {
      rating: 'error',
      explanation: 'Verification failed. Please try again.'
    });
  }
}

// Show verification modal
function showVerificationModal(claim, result) {
  // Remove existing modal
  const existing = document.querySelector('.verity-modal');
  if (existing) existing.remove();
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'verity-modal';
  modal.innerHTML = `
    <div class="verity-modal-overlay"></div>
    <div class="verity-modal-content">
      <button class="verity-modal-close">×</button>
      <h2 class="verity-modal-title">Verification Result</h2>
      <div class="verity-modal-body">
        <div class="verity-rating-badge ${result.rating}">
          <span class="icon">${getRatingIcon(result.rating)}</span>
          <span class="label">${getRatingLabel(result.rating)}</span>
        </div>
        <div class="verity-claim-text">
          <strong>Claim:</strong>
          <p>${claim}</p>
        </div>
        ${result.explanation ? `
          <div class="verity-explanation">
            <strong>Explanation:</strong>
            <p>${result.explanation}</p>
          </div>
        ` : ''}
        ${result.sources && result.sources.length > 0 ? `
          <div class="verity-sources">
            <strong>Sources:</strong>
            <ul>
              ${result.sources.map(s => `<li><a href="${s.url}" target="_blank">${s.name}</a></li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show modal
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Close handlers
  const close = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };
  
  modal.querySelector('.verity-modal-close').addEventListener('click', close);
  modal.querySelector('.verity-modal-overlay').addEventListener('click', close);
}

// Get domain trust score
async function getDomainTrustScore() {
  const domain = window.location.hostname;
  
  try {
    const trustScore = await getDomainTrustAPI(domain);
    
    // Show trust score badge
    showTrustScoreBadge(trustScore);
    
  } catch (error) {
    console.error('Verity: Failed to get trust score', error);
  }
}

// Show trust score badge
function showTrustScoreBadge(trustScore) {
  const badge = document.createElement('div');
  badge.className = 'verity-trust-badge';
  badge.innerHTML = `
    <div class="trust-score-label">Site Trust Score</div>
    <div class="trust-score-value ${getTrustScoreClass(trustScore.score)}">${trustScore.score}/100</div>
    <div class="trust-score-info">Based on ${trustScore.verificationsCount} verifications</div>
  `;
  
  document.body.appendChild(badge);
}

// Get trust score class
function getTrustScoreClass(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}