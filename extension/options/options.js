// Options page script

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  chrome.storage.sync.get({
    autoVerify: true,
    verificationDelay: 2000,
    darkPatternDetection: true,
    domainTrustScore: true,
    ecommerceCheck: true,
    apiEndpoint: 'http://localhost:5000',
    highlightStyle: 'underline',
    showNotifications: true,
    collectStats: false
  }, (items) => {
    // Set form values
    document.getElementById('autoVerify').checked = items.autoVerify;
    document.getElementById('verificationDelay').value = items.verificationDelay;
    document.getElementById('darkPatternDetection').checked = items.darkPatternDetection;
    document.getElementById('domainTrustScore').checked = items.domainTrustScore;
    document.getElementById('ecommerceCheck').checked = items.ecommerceCheck;
    document.getElementById('apiEndpoint').value = items.apiEndpoint;
    document.getElementById('highlightStyle').value = items.highlightStyle;
    document.getElementById('showNotifications').checked = items.showNotifications;
    document.getElementById('collectStats').checked = items.collectStats;
  });
}

// Setup event listeners
function setupEventListeners() {
  // Save settings button
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Test connection button
  document.getElementById('testConnection').addEventListener('click', testConnection);
  
  // Clear cache button
  document.getElementById('clearCache').addEventListener('click', clearCache);
  
  // Reset settings button
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
}

// Save settings
function saveSettings() {
  const settings = {
    autoVerify: document.getElementById('autoVerify').checked,
    verificationDelay: parseInt(document.getElementById('verificationDelay').value),
    darkPatternDetection: document.getElementById('darkPatternDetection').checked,
    domainTrustScore: document.getElementById('domainTrustScore').checked,
    ecommerceCheck: document.getElementById('ecommerceCheck').checked,
    apiEndpoint: document.getElementById('apiEndpoint').value,
    highlightStyle: document.getElementById('highlightStyle').value,
    showNotifications: document.getElementById('showNotifications').checked,
    collectStats: document.getElementById('collectStats').checked
  };
  
  chrome.storage.sync.set(settings, () => {
    showSaveStatus('Settings saved successfully!', 'success');
  });
}

// Test API connection
async function testConnection() {
  const apiEndpoint = document.getElementById('apiEndpoint').value;
  const statusEl = document.getElementById('connectionStatus');
  
  statusEl.textContent = 'Testing...';
  statusEl.className = 'connection-status testing';
  
  try {
    const response = await fetch(`${apiEndpoint}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      statusEl.textContent = '✓ Connected';
      statusEl.className = 'connection-status success';
    } else {
      throw new Error('Connection failed');
    }
  } catch (error) {
    statusEl.textContent = '✕ Connection failed';
    statusEl.className = 'connection-status error';
  }
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'connection-status';
  }, 3000);
}

// Clear cache
function clearCache() {
  if (confirm('Are you sure you want to clear all cached verification results?')) {
    chrome.storage.local.clear(() => {
      showSaveStatus('Cache cleared successfully!', 'success');
    });
  }
}

// Reset settings
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    chrome.storage.sync.clear(() => {
      loadSettings();
      showSaveStatus('Settings reset to defaults!', 'success');
    });
  }
}

// Show save status
function showSaveStatus(message, type) {
  const statusEl = document.getElementById('saveStatus');
  statusEl.textContent = message;
  statusEl.className = `save-status ${type}`;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'save-status';
  }, 3000);
}