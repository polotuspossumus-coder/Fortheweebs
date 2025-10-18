import { useState } from 'react';
import axios from 'axios';

export function useFinalizeOnboarding() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'

  const finalize = async (userId, email) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/onboarding/finalize', { userId, email });
      setStatus(res.data.success ? 'success' : 'error');
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return { finalize, loading, status };
}
