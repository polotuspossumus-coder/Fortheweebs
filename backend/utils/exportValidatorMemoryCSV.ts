import { getValidatorLog } from './validatorMemory';

export function exportValidatorMemoryCSV() {
  const log = getValidatorLog();
  const header = 'Wallet,Tier,Timestamp\n';
  const rows = log.map(v => `${v.wallet},${v.tier},${v.timestamp}`).join('\n');
  return header + rows;
}
