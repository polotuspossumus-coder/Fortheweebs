import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server'; // Express app
import { finalizeOnboarding } from '../src/slabs/onboarding';
import { updateLedger, updateMemory } from '../src/slabs/ledger';

vi.mock('../src/slabs/ledger');

describe('Onboarding Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should finalize onboarding and update ledger/memory', async () => {
    const mockUser = { id: 'user123', email: 'test@weebs.com', role: 'creator' };

    const result = await finalizeOnboarding(mockUser);

    expect(updateLedger).toHaveBeenCalledWith(mockUser.id, expect.any(Object));
    expect(updateMemory).toHaveBeenCalledWith(mockUser.id, expect.any(Object));
    expect(result.success).toBe(true);
  });

  it('should return 200 on full onboarding API flow', async () => {
    const response = await request(app)
      .post('/api/onboarding/finalize')
      .send({ userId: 'user123', email: 'test@weebs.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
