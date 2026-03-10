// Inject domain scoring utilities into page context
// This file loads before content.js

// Make domainScoring.js functions available
if (typeof extractDomain === 'undefined') {
  console.log('Loading domain scoring utilities...');
}