// payments/router.js - AI-powered payment router with Google Vision SafeSearch
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { writeArtifact } = require('../../utils/server-safety');

const vision = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_VISION_KEY || '{}'),
});

// Route payment based on content safety
async function routePayment(contentUrl, amount, creatorId) {
  const routeDecision = {
    timestamp: new Date().toISOString(),
    contentUrl,
    amount,
    creatorId,
    safeSearchResult: null,
    decision: null,
    reason: null,
  };
  
  try {
    // Run Google Vision SafeSearch
    const [result] = await vision.safeSearchDetection(contentUrl);
    const safeSearch = result.safeSearchAnnotation;
    
    routeDecision.safeSearchResult = {
      adult: safeSearch.adult,
      violence: safeSearch.violence,
      racy: safeSearch.racy,
    };
    
    // Decision logic: LIKELY or VERY_LIKELY = adult content
    const isAdult = ['LIKELY', 'VERY_LIKELY'].includes(safeSearch.adult) ||
                    ['LIKELY', 'VERY_LIKELY'].includes(safeSearch.racy);
    
    if (isAdult) {
      routeDecision.decision = 'coinbase';
      routeDecision.reason = 'Adult content detected - routing to crypto';
    } else {
      routeDecision.decision = 'stripe';
      routeDecision.reason = 'Safe content - routing to Stripe Connect';
    }
    
  } catch (error) {
    console.error('[PaymentRouter] Vision API error:', error);
    
    // FALLBACK: Default to crypto on API failure
    routeDecision.decision = 'coinbase';
    routeDecision.reason = 'Vision API failed - defaulting to crypto for safety';
    routeDecision.error = error.message;
  }
  
  // Write immutable receipt
  await writeArtifact('paymentRouterDecision', routeDecision);
  
  return routeDecision;
}

module.exports = {
  routePayment,
};
