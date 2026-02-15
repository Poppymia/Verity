// Natural Language Processing utilities

// Extract claims from text
function extractClaims(text) {
  const claims = [];
  
  // Split into sentences
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  
  sentences.forEach((sentence, index) => {
    sentence = sentence.trim();
    
    // Check if sentence contains claim indicators
    if (isLikelyClaim(sentence)) {
      claims.push({
        text: sentence,
        index: index,
        confidence: calculateClaimConfidence(sentence)
      });
    }
  });
  
  return claims;
}

// Check if sentence is likely a claim
function isLikelyClaim(sentence) {
  // Claim indicators
  const claimIndicators = [
    /\d+%/,  // Percentages
    /\d+\s*(hours?|days?|weeks?|months?|years?)/,  // Time durations
    /\d+\s*(times?|x)/,  // Multipliers
    /(proven|shows?|demonstrates?|indicates?|suggests?)/i,  // Claim verbs
    /(study|research|scientists?|experts?)/i,  // Authority references
    /(best|worst|most|least|fastest|slowest)/i,  // Superlatives
    /(always|never|all|none|every|no)/i,  // Absolutes
    /(waterproof|battery|lasts?|charge)/i,  // Product claims
  ];
  
  // Check if sentence matches any indicators
  return claimIndicators.some(pattern => pattern.test(sentence));
}

// Calculate confidence that text is a claim
function calculateClaimConfidence(sentence) {
  let confidence = 50;
  
  // Increase confidence for numbers
  if (/\d+/.test(sentence)) confidence += 15;
  
  // Increase for percentages
  if (/\d+%/.test(sentence)) confidence += 20;
  
  // Increase for authority references
  if (/(study|research|scientist|expert)/i.test(sentence)) confidence += 10;
  
  // Increase for product claims
  if (/(product|battery|waterproof|guarantee)/i.test(sentence)) confidence += 10;
  
  return Math.min(confidence, 95);
}

// Extract entities from text
function extractEntities(text) {
  const entities = {
    numbers: [],
    percentages: [],
    dates: [],
    products: []
  };
  
  // Extract numbers
  const numbers = text.match(/\d+/g);
  if (numbers) entities.numbers = numbers;
  
  // Extract percentages
  const percentages = text.match(/\d+%/g);
  if (percentages) entities.percentages = percentages;
  
  // Extract dates (simple pattern)
  const dates = text.match(/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/g);
  if (dates) entities.dates = dates;
  
  return entities;
}