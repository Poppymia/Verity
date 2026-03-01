// Popup script

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadTrustScore();
  setupEventListeners();
});

// Load page statistics
async function loadStats() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Get stats from content script
    chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
      if (response) {
        updateStatsDisplay(response.stats);
      } else {
        // Default stats
        updateStatsDisplay({ verified: 0, questionable: 0, false: 0 });
      }
    });
  } catch (error) {
    console.error('Failed to load stats', error);
  }
}

// Update stats display
function updateStatsDisplay(stats) {
  document.getElementById('verifiedCount').textContent = stats.verified || 0;
  document.getElementById('questionableCount').textContent = stats.questionable || 0;
  document.getElementById('falseCount').textContent = stats.false || 0;
}

// Load domain trust score
async function loadTrustScore() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    document.getElementById('domainName').textContent = domain;
    
    // Get trust score from storage or API
    const settings = await getSettings();
    const response = await fetch(`${settings.apiEndpoint}/api/domain-trust/${domain}`);
    
    if (response.ok) {
      const data = await response.json();
      updateTrustScore(data.score);
    } else {
      // Mock data for testing
      const mockScore = Math.floor(Math.random() * 40) + 60;
      updateTrustScore(mockScore);
    }
  } catch (error) {
    console.error('Failed to load trust score', error);
    updateTrustScore(75); // Default
  }
}

// Update trust score display
function updateTrustScore(score) {
  const scoreValue = document.getElementById('trustScoreValue');
  const scoreCircle = document.getElementById('trustScoreCircle');
  const scoreDesc = document.getElementById('trustScoreDesc');
  
  scoreValue.textContent = score;
  
  // Set color based on score
  scoreCircle.className = 'trust-score-circle';
  if (score >= 80) {
    scoreCircle.classList.add('high');
    scoreDesc.textContent = 'Highly trusted source';
  } else if (score >= 50) {
    scoreCircle.classList.add('medium');
    scoreDesc.textContent = 'Moderately trusted';
  } else {
    scoreCircle.classList.add('low');
    scoreDesc.textContent = 'Use with caution';
  }
}

// Get settings from storage
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      apiEndpoint: 'http://localhost:5000'
    }, (items) => {
      resolve(items);
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Scan button
  document.getElementById('scanBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
    
    // Show scanning message
    showMessage('Scanning page...', 'info');
    
    // Reload stats after 3 seconds
    setTimeout(loadStats, 3000);
  });
  
  // Report button
  document.getElementById('reportBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.create({
      url: `https://verity-app.com/report?url=${encodeURIComponent(tab.url)}`
    });
  });
  
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Load total stats
  loadTotalStats();
}

// Load total stats
async function loadTotalStats() {
  chrome.storage.local.get(['totalToday', 'installDate'], (data) => {
    document.getElementById('totalToday').textContent = data.totalToday || 0;
    
    if (data.installDate) {
      const installDate = new Date(data.installDate);
      const now = new Date();
      const days = Math.floor((now - installDate) / (1000 * 60 * 60 * 24));
      document.getElementById('activeSince').textContent = `${days} days`;
    } else {
      document.getElementById('activeSince').textContent = 'Today';
    }
  });
}

// Show message
function showMessage(text, type) {
  // You can implement a toast notification here
  console.log(`[${type}] ${text}`);
}