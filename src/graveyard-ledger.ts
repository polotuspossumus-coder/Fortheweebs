// graveyard-ledger.ts
export interface GraveyardEntry {
  artifactId: string;
  creatorId: string;
  tributeType: string;
  reason: string;
  sealedAt: number;
  [key: string]: any;
}

const graveyardLedger: GraveyardEntry[] = [];

export function getGraveyardLedger(): GraveyardEntry[] {
  return graveyardLedger;
}

export function logToGraveyard(entry: Omit<GraveyardEntry, 'sealedAt'>) {
  graveyardLedger.push({
    ...entry,
    sealedAt: Date.now(),
  });
}
