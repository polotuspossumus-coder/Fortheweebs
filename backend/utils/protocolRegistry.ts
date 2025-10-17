type Protocol = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'active' | 'deprecated' | 'experimental';
};

const registry: Protocol[] = [];

export function registerProtocol(name: string, description: string, status: Protocol['status'] = 'active') {
  const id = `proto-${Date.now()}`;
  registry.push({ id, name, description, createdAt: new Date().toISOString(), status });
  return id;
}

export function listProtocols() {
  return registry;
}
