import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const CreatorAnalytics = ({ userId }) => {
  const [metrics, setMetrics] = useState({
    overlaysUsed: 0,
    badgesMinted: 0,
    remixSessions: 0,
    lastActive: '',
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data: overlays } = await supabase
        .from('overlay_logs')
        .select('*')
        .eq('user_id', userId);

      const { data: badges } = await supabase.from('badges').select('*').eq('user_id', userId);

      const { data: sessions } = await supabase
        .from('remix_sessions')
        .select('*')
        .eq('user_id', userId);

      const lastActive = sessions?.[0]?.timestamp || 'N/A';

      setMetrics({
        overlaysUsed: overlays?.length || 0,
        badgesMinted: badges?.length || 0,
        remixSessions: sessions?.length || 0,
        lastActive,
      });
    };

    fetchMetrics();
  }, [userId]);

  return (
    <div className="creator-analytics">
      <h2>📊 Creator Analytics</h2>
      <ul>
        <li>Overlays Used: {metrics.overlaysUsed}</li>
        <li>Badges Minted: {metrics.badgesMinted}</li>
        <li>Remix Sessions: {metrics.remixSessions}</li>
        <li>Last Active: {metrics.lastActive}</li>
      </ul>
    </div>
  );
};
