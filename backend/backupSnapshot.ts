import fs from 'fs';
import { getCodex } from './codex';
import { listSlabs } from './slabIndex';
import { getManifest } from './slabManifest';

setInterval(() => {
  const snapshot = {
    codex: getCodex(),
    slabs: listSlabs(),
    manifest: getManifest(),
  };
  fs.writeFileSync(`backup-${Date.now()}.json`, JSON.stringify(snapshot, null, 2));
}, 1000 * 60 * 60); // hourly
