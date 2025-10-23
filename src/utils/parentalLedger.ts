// src/utils/parentalLedger.ts

export type ParentalLogEntry = {
  userId: string;
  action: string;
  timestamp: string;
  details: string;
};


const parentalLedger: ParentalLogEntry[] = [];

// --- Forensic/Moderation Stubs (hoisted for use in sealAndEscalate) ---
function perceptualHash(imageData: string): string {
  // TODO: Implement perceptual hash for images
  return "stubbed-hash-" + imageData.length;
}

/**
 * Log a forensic artifact upload event to the in-memory forensicLogs ledger.
 * @param data - { hash, timestamp, uploaderId }
 */
export function logForensicArtifact(data: {
  hash: string;
  timestamp: string;
  uploaderId: string;
}) {
  database.forensicLogs.push({
    ...data,
    status: "SEALED",
    reviewed: false,
  });
}

function queueForManualReview(forensic: { hash: string; timestamp: string; uploaderId: string }) {
  // TODO: Implement queueing for manual review by moderators
  // This could push to a moderation queue or alert system
  console.warn("[Manual Review Queued]", forensic);
}

export function logParentalAction(userId: string, action: string, details?: string) {
  parentalLedger.push({
    userId,
    action,
    timestamp: new Date().toISOString(),
    details: details ?? "",
  });
}

export function getParentalLedger(userId?: string): ParentalLogEntry[] {
  return userId ? parentalLedger.filter(l => l.userId === userId) : [...parentalLedger];
}

// Example usage:
// logParentalAction(user.id, "Content auto-rated as PG-13", `AI flagged keywords: 'blood', 'scream'`);

// Example AI content rating logic:
// if (text.includes("blood") && text.includes("scream")) rating = "PG-13";
// if (text.includes("sex") && !contextualized) rating = "M";

// Example moderation/upload logic:
// if (isStylized(content) && withinLegalLimits(content)) {
//   content.rating = autoRate(content); // G, PG, PG-13, M
//   allowUpload(content);
// } else if (isIllegal(content)) {
//   seal(content);
//   logForensic(content);
//   queueForManualReview(content);
// }

export function extractKeywords(text: string) {
  const lower = text.toLowerCase();
  return {
    pg: /ghost|scary|fight/.test(lower),
    pg13: /blood|scream|violence/.test(lower),
    mature: /sex|nude|drugs|explicit/.test(lower),
    illegal: /csam|child porn|kill|rape/.test(lower),
  };
}


export function sealAndEscalate(content: {
  text: string;
  imageData: string;
  uploaderId: string;
}) {
  const forensic = {
    hash: perceptualHash(content.imageData),
    timestamp: new Date().toISOString(),
    uploaderId: content.uploaderId,
  };

  logForensicArtifact(forensic);
  queueForManualReview(forensic);
}
