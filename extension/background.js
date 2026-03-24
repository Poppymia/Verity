// Background Service Worker
importScripts('utils/claudeJsonParse.js');

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

  if (request.action === 'analyzeTrustWithClaude') {
    analyzeTrustWithClaudeInBackground(request.payload)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => {
        console.error('Background Claude trust analysis failed:', error);
        sendResponse({ ok: false, error: error?.message || 'Unknown error' });
      });
  }
  
  return true;
});

function getClaudeApiKeyFromSync() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ claudeApiKey: '' }, (items) => {
      resolve(items.claudeApiKey || '');
    });
  });
}

async function analyzeTrustWithClaudeInBackground(payload) {
  const apiKey = await getClaudeApiKeyFromSync();
  if (!apiKey) return null;

  const url = payload?.url || '';
  const domain = payload?.domain || '';
  const pageText = (payload?.pageText || '').slice(0, 6000);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 350,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'You are a web trust analyst. ' +
                'Given a website URL, domain, and page excerpt, estimate how trustworthy the page is. ' +
                'Return only valid JSON with exactly these keys: ' +
                '{ "score": <0-100 integer>, "category": "<one short label>", "reason": "<short reason <= 160 chars>", "confidence": <0-100 integer> }. ' +
                'Score guidance: >=80 trusted, 50-79 caution, <50 high risk. ' +
                'Do not include markdown, explanations, or extra keys.\n\n' +
                `URL: ${url}\n` +
                `Domain: ${domain}\n` +
                `Page excerpt:\n${pageText}`
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const contentBlocks = data?.content || [];
  const textBlock = contentBlocks.find((b) => b.type === 'text');
  const rawText = textBlock?.text || '';

  const parsed = parseClaudeJsonObject(rawText);
  if (!parsed) {
    console.warn('Verity: Claude trust response (unparseable):', (rawText || '').slice(0, 500));
    throw new Error('Invalid JSON returned by Claude.');
  }

  let score = typeof parsed.score === 'number' ? parsed.score : 50;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const category = typeof parsed.category === 'string' && parsed.category.trim()
    ? parsed.category.trim()
    : 'ai-analysis';

  const reason = typeof parsed.reason === 'string' && parsed.reason.trim()
    ? parsed.reason.trim()
    : 'AI trust estimate based on domain and page content.';

  let color = 'yellow';
  let status = 'neutral';
  if (score >= 80) {
    color = 'green';
    status = 'trusted';
  } else if (score < 50) {
    color = 'red';
    status = 'untrusted';
  }

  return {
    score,
    category,
    reason,
    color,
    status,
    apiVerified: true,
    aiAnalyzed: true,
    analyzedAt: new Date().toISOString()
  };
}