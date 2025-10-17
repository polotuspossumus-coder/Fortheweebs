export function calculateTier(paymentAmount: number, first25Count: number): { tier: string; profitShare: number } {
  if (paymentAmount === 100 && first25Count < 25) {
    return { tier: 'early-100', profitShare: 1.0 };
  }
  if (paymentAmount === 100) {
    return { tier: 'standard-95', profitShare: 0.95 };
  }
  if (paymentAmount === 50) {
    return { tier: 'support-85', profitShare: 0.85 };
  }
  if (paymentAmount === 15) {
    return { tier: 'adult-80', profitShare: 0.80 };
  }
  return { tier: 'unknown', profitShare: 0 };
}
