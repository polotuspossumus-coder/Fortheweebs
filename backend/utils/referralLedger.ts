type ReferralStats = {
  code: string;
  wallets: string[];
};

const referralLedger: ReferralStats[] = [];

export function logReferral(code: string, wallet: string) {
  let entry = referralLedger.find(r => r.code === code);
  if (!entry) {
    entry = { code, wallets: [] };
    referralLedger.push(entry);
  }
  if (!entry.wallets.includes(wallet)) entry.wallets.push(wallet);
}

export function getReferralRewards(code: string) {
  const entry = referralLedger.find(r => r.code === code);
  const count = entry?.wallets.length || 0;
  const reward = count >= 10 ? 'Legendary' : count >= 5 ? 'Epic' : count >= 3 ? 'Rare' : 'Common';
  return { count, reward };
}
