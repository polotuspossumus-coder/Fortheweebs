import { hashPassword } from "../utils/parentalControls";

export type ParentalControls = {
  rating: string; // e.g., "PG-13"
  passwordHash: string;
  creationLocked: boolean;
};

// Helper to compare content ratings by severity order
const RATING_ORDER = ["G", "PG", "PG-13", "M", "MA", "XXX"];
function ratingIndex(rating: string) {
  return RATING_ORDER.indexOf(rating);
}

export function canView(contentRating: string, userRating: string): boolean {
  return ratingIndex(contentRating) <= ratingIndex(userRating);
}

export function canCreate(contentRating: string, controls: ParentalControls): boolean {
  return !controls.creationLocked || ratingIndex(contentRating) <= ratingIndex(controls.rating);
}

export async function canModifyControls(inputPassword: string, controls: ParentalControls): Promise<boolean> {
  const inputHash = await hashPassword(inputPassword);
  return inputHash === controls.passwordHash;
}
