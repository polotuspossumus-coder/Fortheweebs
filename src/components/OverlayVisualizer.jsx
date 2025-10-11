import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { remixConfig } from '../config/remix.config';
import { supabase } from '../lib/supabase';

export const OverlayVisualizer = ({ userId }) => {
  const [preset, setPreset] = useState(null);

  useEffect(() => {
    const fetchPreset = async () => {
      const { data } = await supabase
        .from('overlay_presets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      setPreset(data?.[0]);
    };
    fetchPreset();
  }, [userId]);

  if (!preset) return <p>Loading overlay preview...</p>;

  return (
    <motion.div
      className="overlay-preview"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        backgroundImage: `url(${preset.background_url})`,
        color: preset.text_color,
        fontFamily: preset.font_family,
      }}
    >
      <h2>{preset.title}</h2>
      <p>{preset.subtitle}</p>
      <span className="remix-anchor">🔗 {remixConfig.remixAnchor}</span>
    </motion.div>
  );
};
