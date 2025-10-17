import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

export default function LoreChainVisualizer() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/api/lore-chain').then(res => setData(res.data));
  }, []);

  useEffect(() => {
    const svg = d3.select('#lore-chain').attr('width', 800).attr('height', 400);
    svg.selectAll('*').remove();

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (_, i) => 50 + i * 80)
      .attr('cy', 200)
      .attr('r', 30)
      .attr('fill', d => ({
        Founders: '#FFD700',
        Supporter: '#00FF99',
        Crew: '#9999FF',
        'Adult Access': '#FF6666',
      }[d.tier] || '#ccc'))
      .append('title')
      .text(d => d.myth);
  }, [data]);

  return <svg id="lore-chain"></svg>;
}
