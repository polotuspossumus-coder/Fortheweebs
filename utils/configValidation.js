// utils/configValidation.js - Boot-time config validation
const { writeArtifact } = require('./server-safety');

function validateConfig() {
  // Truly critical for server to start
  const required = [
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY',
    'JWT_SECRET'
  ];
  
  const missing = [];
  const warnings = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  // Optional but recommended - server will work without these
  const optional = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY', 
    'BUGFIXER_TOKEN',
    'COINBASE_API_KEY',
    'GOOGLE_VISION_KEY', 
    'ARTIFACT_BUCKET', 
    'APP_VERSION',
    'ANTHROPIC_API_KEY',
    'PHOTODNA_API_KEY'
  ];
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(`Optional env var missing: ${key}`);
    }
  }
  
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    
    writeArtifact('configValidationFailed', {
      missing,
      warnings,
    });
    
    throw error;
  }
  
  if (warnings.length > 0) {
    console.warn('[Config] Warnings:', warnings);
    writeArtifact('configValidationWarnings', { warnings });
  }
  
  console.log('[Config] ✅ All required environment variables present');
  return true;
}

module.exports = {
  validateConfig,
};
