// Background Service Worker

console.log('Verity: Background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      domainScoring: true,
      showNotifications: true,
      showBadge: true,
      manualVerification: true
    });
    
    console.log('Verity installed successfully');
  }
  
  // Create context menu for manual verification
  chrome.contextMenus.create({
    id: 'verifyText',
    title: 'Verify with Verity',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'verifyText' && info.selectionText) {
    // Send message to content script to verify
    chrome.tabs.sendMessage(tab.id, {
      action: 'verifySelection',
      text: info.selectionText
    });
  }
});

// Handle keyboard shortcut (Ctrl+Shift+V)
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'verify-selection') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'verifySelection'
    });
  }
});

// Handle badge updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    if (sender.tab) {
      chrome.action.setBadgeText({
        text: request.text,
        tabId: sender.tab.id
      });
      chrome.action.setBadgeBackgroundColor({
        color: request.color,
        tabId: sender.tab.id
      });
    }
  }
  
  return true;
});