// Dark pattern detection

function detectDarkPatterns() {
  console.log('Verity: Checking for dark patterns...');
  
  const patterns = [];
  
  // Detect fake countdown timers
  const fakeTimers = detectFakeCountdowns();
  if (fakeTimers.length > 0) {
    patterns.push(...fakeTimers);
  }
  
  // Detect fake scarcity
  const scarcity = detectFakeScarcity();
  if (scarcity.length > 0) {
    patterns.push(...scarcity);
  }
  
  // Detect hidden subscriptions
  const subscriptions = detectHiddenSubscriptions();
  if (subscriptions.length > 0) {
    patterns.push(...subscriptions);
  }
  
  // Alert user if patterns found
  if (patterns.length > 0) {
    showDarkPatternAlert(patterns);
  }
  
  return patterns;
}

// Detect fake countdown timers
function detectFakeCountdowns() {
  const patterns = [];
  const timers = document.querySelectorAll('[class*="count"], [class*="timer"], [id*="count"], [id*="timer"]');
  
  timers.forEach((timer) => {
    const text = timer.textContent.toLowerCase();
    
    // Check for time patterns
    if (/\d+:\d+:\d+/.test(text) || /\d+\s*(hours?|minutes?|seconds?)/.test(text)) {
      // Check if it's in JavaScript code (likely fake if reset)
      const scripts = Array.from(document.scripts);
      const hasResetCode = scripts.some(script => 
        script.textContent.includes('setInterval') && 
        script.textContent.includes(timer.className || timer.id)
      );
      
      if (hasResetCode) {
        patterns.push({
          type: 'fake-countdown',
          element: timer,
          severity: 'high',
          message: 'Fake countdown timer detected - this timer may reset'
        });
      }
    }
  });
  
  return patterns;
}

// Detect fake scarcity
function detectFakeScarcity() {
  const patterns = [];
  const text = document.body.textContent.toLowerCase();
  
  // Scarcity phrases
  const scarcityPhrases = [
    /only \d+ left/i,
    /\d+ people are viewing/i,
    /limited (time|stock|offer)/i,
    /hurry.*limited/i,
    /last chance/i,
    /selling fast/i
  ];
  
  scarcityPhrases.forEach((phrase) => {
    if (phrase.test(text)) {
      // Find all matching elements
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        phrase.test(el.textContent) && el.children.length === 0
      );
      
      elements.forEach((element) => {
        patterns.push({
          type: 'fake-scarcity',
          element: element,
          severity: 'medium',
          message: 'Potential artificial scarcity detected'
        });
        
        // Highlight the element
        element.style.outline = '2px dashed #FFB300';
        element.style.backgroundColor = 'rgba(255, 179, 0, 0.1)';
      });
    }
  });
  
  return patterns;
}

// Detect hidden subscriptions
function detectHiddenSubscriptions() {
  const patterns = [];
  
  // Look for subscription-related text
  const subscriptionTerms = [
    'auto-renew',
    'recurring',
    'subscription',
    'monthly fee',
    'annual fee'
  ];
  
  const allText = document.body.textContent.toLowerCase();
  
  subscriptionTerms.forEach((term) => {
    if (allText.includes(term)) {
      // Find small or hidden text
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        if (!el.textContent.toLowerCase().includes(term)) return false;
        
        const styles = window.getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        const opacity = parseFloat(styles.opacity);
        
        // Check if text is suspiciously small or faded
        return fontSize < 12 || opacity < 0.7;
      });
      
      elements.forEach((element) => {
        patterns.push({
          type: 'hidden-subscription',
          element: element,
          severity: 'high',
          message: 'Hidden subscription terms detected'
        });
        
        // Make it visible
        element.style.fontSize = '14px';
        element.style.opacity = '1';
        element.style.backgroundColor = 'rgba(255, 61, 0, 0.1)';
        element.style.padding = '8px';
      });
    }
  });
  
  return patterns;
}

// Show dark pattern alert
function showDarkPatternAlert(patterns) {
  const alert = document.createElement('div');
  alert.className = 'verity-dark-pattern-alert';
  alert.innerHTML = `
    <div class="alert-header">
      <span class="alert-icon">⚠️</span>
      <span class="alert-title">Dark Patterns Detected</span>
      <button class="alert-close">×</button>
    </div>
    <div class="alert-body">
      <p>Verity found ${patterns.length} suspicious pattern${patterns.length !== 1 ? 's' : ''} on this page:</p>
      <ul>
        ${patterns.map(p => `<li><strong>${formatPatternType(p.type)}:</strong> ${p.message}</li>`).join('')}
      </ul>
    </div>
  `;
  
  // Add CSS
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    max-width: 500px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  
  document.body.appendChild(alert);
  
  // Close button
  alert.querySelector('.alert-close').addEventListener('click', () => {
    alert.remove();
  });
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (document.body.contains(alert)) {
      alert.remove();
    }
  }, 10000);
}

// Format pattern type for display
function formatPatternType(type) {
  const types = {
    'fake-countdown': 'Fake Countdown Timer',
    'fake-scarcity': 'Artificial Scarcity',
    'hidden-subscription': 'Hidden Subscription'
  };
  return types[type] || type;
}