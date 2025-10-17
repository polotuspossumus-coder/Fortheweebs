// Sample wallet claims for onboarding/testing
const wallets = ['0xabc', '0xdef', '0xghi'];
wallets.forEach((wallet, i) => {
  logValidatorClaim({
    wallet,
    tier: i === 0 ? 'Founders' : 'Supporter',
    referralCode: `ref${i}`,
  });
});
type ValidatorClaim = {
  wallet: string;
  tier: string;
  timestamp: string;
  referralCode?: string;
};

const validatorLog: ValidatorClaim[] = [];

export function logValidatorClaim(claim: Omit<ValidatorClaim, 'timestamp'>) {
  validatorLog.push({ ...claim, timestamp: new Date().toISOString() });
}

export function getValidatorLog() {
  return validatorLog;
}
