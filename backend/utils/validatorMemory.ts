type ValidatorClaim = {
  wallet: string;
  tier: string;
  timestamp: string;
};

const validatorLog: ValidatorClaim[] = [];

export function logValidatorClaim(claim: Omit<ValidatorClaim, 'timestamp'>) {
  validatorLog.push({ ...claim, timestamp: new Date().toISOString() });
}

export function getValidatorLog() {
  return validatorLog;
}
