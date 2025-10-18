import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { lore } = req.body;
  const { data, error } = await supabase
    .from('lore_submissions')
    .insert([{ content: lore, status: 'pending', submittedAt: new Date().toISOString() }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Lore submitted successfully', id: data[0].id });
}
