// Background Service Worker
console.log('Verity extension loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      autoVerify: true,
      darkPatternDetection: true,
      domainTrustScore: true,
      apiEndpoint: 'http://localhost:5000',
      verificationDelay: 2000 // 2 seconds
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://verity-app.com/welcome'
    });
  }
});

// Handle keyboard shortcut (Ctrl+Shift+V)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'verify-selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'verifySelection' 
      });
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    // Update extension badge with verification count
    chrome.action.setBadgeText({
      text: request.count.toString(),
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: request.color || '#0066FF',
      tabId: sender.tab.id
    });
  }
  
  if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }
  
  return true;
});

// Context menu for manual verification
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'verifyText',
    title: 'Verify with Verity',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'verifyText') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'verifySelection',
      text: info.selectionText
    });
  }
});