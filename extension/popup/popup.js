// Popup script - Domain Trust Display

document.addEventListener('DOMContentLoaded', async () => {
  await loadDomainScore();
  setupEventListeners();
});

function hostnameForTab(tab) {
  try {
    const url = new URL(tab.url);
    let domain = url.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch {
    return '';
  }
}

// Load current domain score
async function loadDomainScore() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const domain = hostnameForTab(tab);
    document.getElementById('domainName').textContent = domain || '—';

    // Prefer live score from this tab (avoids stale storage from another site)
    const liveScore = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: 'getDomainScore' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(response?.score ?? null);
      });
    });

    if (liveScore && typeof liveScore.score === 'number') {
      if (!domain || !liveScore.domain || liveScore.domain === domain) {
        updateScoreDisplay(liveScore);
        return;
      }
    }

    chrome.storage.local.get(['currentDomain'], (data) => {
      const stored = data.currentDomain;
      if (
        stored &&
        typeof stored.score === 'number' &&
        domain &&
        stored.domain === domain
      ) {
        updateScoreDisplay(stored);
        return;
      }
      if (liveScore && typeof liveScore.score === 'number') {
        updateScoreDisplay(liveScore);
        return;
      }
      showDefaultScore();
    });
  } catch (error) {
    console.error('Failed to load domain score', error);
    showDefaultScore();
  }
}

// Update score display
function updateScoreDisplay(scoreData) {
  const scoreValue = document.getElementById('trustScoreValue');
  const scoreCircle = document.getElementById('trustScoreCircle');
  const scoreDesc = document.getElementById('trustScoreDesc');
  const categoryDisplay = document.getElementById('categoryDisplay');
  const reasonDisplay = document.getElementById('reasonDisplay');
  
  // Set score
  scoreValue.textContent = scoreData.score;
  
  // Set color class
  scoreCircle.className = 'trust-score-circle';
  if (scoreData.score >= 80) {
    scoreCircle.classList.add('high');
    scoreDesc.textContent = 'Highly Trusted';
  } else if (scoreData.score >= 50) {
    scoreCircle.classList.add('medium');
    scoreDesc.textContent = 'Use Caution';
  } else {
    scoreCircle.classList.add('low');
    scoreDesc.textContent = 'High Risk';
  }
  
  // Set category and reason
  if (categoryDisplay) {
    categoryDisplay.textContent = `Category: ${scoreData.category}`;
  }
  if (reasonDisplay) {
    reasonDisplay.textContent = scoreData.reason;
  }
}

// Show default score
function showDefaultScore() {
  const scoreValue = document.getElementById('trustScoreValue');
  const scoreDesc = document.getElementById('trustScoreDesc');
  
  scoreValue.textContent = '--';
  scoreDesc.textContent = 'Analyzing...';
}

// Setup event listeners
function setupEventListeners() {
  // Rescan button
  const rescanBtn = document.getElementById('rescanBtn');
  if (rescanBtn) {
    rescanBtn.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'rescanDomain' });
      
      // Show scanning message
      const scoreDesc = document.getElementById('trustScoreDesc');
      scoreDesc.textContent = 'Rescanning...';
      
      // Reload after 2 seconds
      setTimeout(loadDomainScore, 2000);
    });
  }
  
  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
  
  // How It Works button - opens frontend page
  const learnMoreBtn = document.getElementById('learnMoreBtn');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
      chrome.tabs.create({
        url: 'http://localhost:3000'
      });
      
      // After page opens, navigate to how-it-works
      setTimeout(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, { 
              url: 'http://localhost:3000' 
            });
          }
        });
      }, 500);
    });
  }
}