import { supabase } from '../lib/supabase';

export const mintBadge = async (userId, remixAnchor) => {
  const badge = `badge-${remixAnchor}-${Date.now()}`;
  const { data, error } = await supabase
    .from('badges')
    .insert([{ user_id: userId, badge, minted_at: new Date().toISOString() }]);

  if (error) throw new Error('Badge minting failed');
  return data;
};
