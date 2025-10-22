// Alternate naming for compatibility with other modules
export type Rating = 'G' | 'PG' | 'PG-13' | 'M' | 'MA' | 'XXX';

export interface ParentalSettings {
  passkey: string;
  allowed: Rating[];
  childMode: boolean;
}

/**
 * Determines if content is allowed based on parental settings and user status (alternate signature).
 */
export function isAllowed(rating: Rating, settings: ParentalSettings, isPaid: boolean): boolean {
  if (rating === 'XXX' && !isPaid) return false;
  if (settings.childMode && !settings.allowed.includes(rating)) return false;
  return true;
}
export type ContentRating = 'G' | 'PG' | 'PG-13' | 'M' | 'MA' | 'XXX';

export interface ParentalSettings {
  passkey: string;
  allowedRatings: ContentRating[];
  childMode: boolean;
}

/**
 * Determines if content is allowed based on parental settings and user status.
 * @param rating - The content rating to check
 * @param settings - The parental settings object
 * @param isPayingUser - Whether the user is a paying customer
 * @returns true if allowed, false otherwise
 */
export function isContentAllowed(
  rating: ContentRating,
  settings: ParentalSettings,
  isPayingUser: boolean
): boolean {
  if (settings.childMode && !settings.allowedRatings.includes(rating)) return false;
  if (rating === 'XXX' && !isPayingUser) return false;
  return true;
}
// parentalControls.ts

/**
 * Hash a password using a simple SHA-256 algorithm (browser or Node.js compatible).
 * In production, use a secure, salted hash (e.g., bcrypt or scrypt).
 */
export async function hashPassword(password: string): Promise<string> {
  if (window && window.crypto && window.crypto.subtle) {
    // Browser
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  } else {
    // Node.js fallback
    const { createHash } = await import("crypto");
    return createHash("sha256").update(password).digest("hex");
  }
}

export type ParentalControls = {
  rating: string;
  passwordHash: string;
};

/**
 * Check if the input password matches the stored parental controls password hash.
 */
export async function canModifyParentalControls(inputPassword: string, parentalControls: ParentalControls): Promise<boolean> {
  const inputHash = await hashPassword(inputPassword);
  return inputHash === parentalControls.passwordHash;
}
