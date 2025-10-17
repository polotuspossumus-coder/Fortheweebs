type AuditLog = {
  action: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

const auditTrail: AuditLog[] = [];

export function logAction(action: string, actor: string, metadata?: Record<string, any>) {
  auditTrail.push({ action, actor, timestamp: new Date().toISOString(), metadata });
}
