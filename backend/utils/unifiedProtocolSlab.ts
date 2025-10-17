import crypto from 'crypto';

// === Types ===
type Validator = {
  wallet: string;
  tier: string;
  region: string;
  ritualsCompleted: string[];
  grantsAwarded: string[];
  disputesFiled: string[];
};

type Protocol = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'deprecated' | 'immortal';
  createdAt: string;
  hash: string;
};

type Slab = {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  linkedProtocols: string[];
};

type LoreBeacon = {
  id: string;
  title: string;
  lore: string;
  timestamp: string;
  author: string;
};

type Resurrection = {
  wallet: string;
  reason: string;
  resurrectedAt: string;
};

type AuditLog = {
  action: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

// === State Stores ===
const validators: Validator[] = [];
const protocols: Protocol[] = [];
const slabs: Slab[] = [];
const loreBeacons: LoreBeacon[] = [];
const resurrections: Resurrection[] = [];
const auditTrail: AuditLog[] = [];

// === Core Functions ===

// Register validator
export function registerValidator(data: Omit<Validator, 'ritualsCompleted' | 'grantsAwarded' | 'disputesFiled'>) {
  const validator: Validator = { ...data, ritualsCompleted: [], grantsAwarded: [], disputesFiled: [] };
  validators.push(validator);
  logAction('register_validator', data.wallet, { tier: data.tier });
  return validator;
}

// Immortalize protocol
export function immortalizeProtocol(name: string, description: string) {
  const id = `proto-${Date.now()}`;
  const hash = crypto.createHash('sha256').update(name + description + Date.now()).digest('hex');
  const protocol: Protocol = {
    id,
    name,
    description,
    status: 'immortal',
    createdAt: new Date().toISOString(),
    hash,
  };
  protocols.push(protocol);
  logAction('immortalize_protocol', 'system', { id, name });
  return protocol;
}

// Register slab
export function registerSlab(name: string, category: string, linkedProtocols: string[] = []) {
  const id = `slab-${Date.now()}`;
  const slab: Slab = {
    id,
    name,
    category,
    createdAt: new Date().toISOString(),
    linkedProtocols,
  };
  slabs.push(slab);
  logAction('register_slab', 'system', { name, category });
  return slab;
}

// Publish lore beacon
export function publishLore(title: string, lore: string, author: string) {
  const id = `beacon-${Date.now()}`;
  const beacon: LoreBeacon = {
    id,
    title,
    lore,
    timestamp: new Date().toISOString(),
    author,
  };
  loreBeacons.push(beacon);
  logAction('publish_lore', author, { title });
  return beacon;
}

// Resurrect validator
export function resurrectValidator(wallet: string, reason: string) {
  const entry: Resurrection = {
    wallet,
    reason,
    resurrectedAt: new Date().toISOString(),
  };
  resurrections.push(entry);
  logAction('resurrect_validator', wallet, { reason });
  return entry;
}

// Log governance action
export function logAction(action: string, actor: string, metadata?: Record<string, any>) {
  auditTrail.push({ action, actor, timestamp: new Date().toISOString(), metadata });
}

// === Query Functions ===
export function getCodex() {
  return validators;
}

export function getManifest() {
  return protocols;
}

export function getSlabs() {
  return slabs;
}

export function getLoreBeacons() {
  return loreBeacons;
}

export function getResurrections() {
  return resurrections;
}

export function getAuditTrail() {
  return auditTrail;
}
