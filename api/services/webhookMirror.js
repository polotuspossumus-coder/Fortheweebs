/**
 * Webhook Mirror Service
 * Mirrors notary records to external endpoint for independent auditing
 * Makes governance provable beyond Fortheweebs
 */

const WEBHOOK_URL = process.env.NOTARY_WEBHOOK_URL; // set in .env

/**
 * Mirror a notary record to external webhook
 * @param {object} record - Notary record to mirror
 */
async function mirrorRecord(record) {
  if (!WEBHOOK_URL) {
    // Webhook not configured - silent skip
    return;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Notary-Hash': record.hash,
        'X-Notary-Version': record.version.toString(),
      },
      body: JSON.stringify(record),
      timeout: 5000, // 5 second timeout
    });

    if (response.ok) {
      console.log(`🔗 Notary record #${record.id} mirrored externally (hash: ${record.hash.slice(0, 12)}...)`);

      // Push to artifact stream
      if (global.artifactStream) {
        global.artifactStream.push({
          timestamp: new Date().toISOString(),
          type: 'WEBHOOK',
          severity: 'info',
          message: `External mirror confirmed: ledger #${record.id}`,
          data: { recordId: record.id, hash: record.hash.slice(0, 12) },
        });
      }
    } else {
      console.warn(`⚠️ Webhook mirror failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('⚠️ Webhook mirror error:', error.message);

    // Don't fail the notary operation if webhook fails
    // Webhook is best-effort external auditing
  }
}

/**
 * Test webhook connectivity
 * @returns {Promise<boolean>} True if webhook is reachable
 */
async function testWebhook() {
  if (!WEBHOOK_URL) {
    console.log('ℹ️ Webhook mirror not configured (NOTARY_WEBHOOK_URL not set)');
    return false;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'HEAD',
      timeout: 3000,
    });

    if (response.ok) {
      console.log(`✅ Webhook mirror connected: ${WEBHOOK_URL}`);
      return true;
    } else {
      console.warn(`⚠️ Webhook unreachable: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('⚠️ Webhook test failed:', error.message);
    return false;
  }
}

module.exports = {
  mirrorRecord,
  testWebhook,
};
