import { getRuntimeInfo } from '@/utils/runtimeIntrospect';

export const GenesisProtocol = async () => {
  const runtime = await getRuntimeInfo();

  return {
    remixAnchor: `remix-${runtime.platform}-${runtime.version}`,
    timestamp: new Date().toISOString(),
    sovereignHash: crypto.randomUUID(),
  };
};
