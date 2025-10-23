import { z } from 'zod';

export const profileSchema = z.object({
  username: z.string().min(3),
  tier: z.enum(['mythic', 'standard', 'legacy', 'supporter', 'general']),
});
