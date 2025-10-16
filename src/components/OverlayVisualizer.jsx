import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { remixConfig } from '../config/remix.config';
import { supabase } from '../lib/supabase';
import "./OverlayVisualizer.css";

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
    <div
      className="overlay-visualizer"
      style={{
        ['--overlay-bg']: preset.background_url ? `url(${preset.background_url})` : undefined,
        ['--overlay-text-color']: preset.text_color || undefined,
        ['--overlay-font-family']: preset.font_family || undefined,
      }}
    >
      <h2>{preset.title}</h2>
      <p>{preset.subtitle}</p>
      <span className="remix-anchor">🔗 {remixConfig.remixAnchor}</span>
    </div>
  );
};
