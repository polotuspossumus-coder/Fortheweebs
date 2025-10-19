import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function cache<T>(key: string, fetcher: () => Promise<T>, ttl = 60): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetcher();
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
  return data;
}
