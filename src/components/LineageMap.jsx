import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';
import { supabase } from '../lib/supabase';
import './LineageMap.css';

// Accept optional `nodes` prop for testability. If provided, `nodes` will be used
// directly instead of fetching from supabase.
const LineageMapInner = ({ userId, nodes: propNodes, onSelect: onSelectProp, onSelectionChange, multiSelect = true, announceSelections = true }, ref) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const liveRef = useRef(null);

  useEffect(() => {
    const fetchAndRender = async () => {
      let nodes = propNodes;
      if (!nodes) {
        const { data } = await supabase
          .from('remix_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: true });

        nodes =
          data?.map((session, i) => ({
            id: session.remix_anchor,
            x: 50 + i * 100,
            y: 200,
            timestamp: session.timestamp,
          })) || [];
      }

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      // tooltip (HTML overlay)
      let tooltip = d3.select(tooltipRef.current);
      if (tooltip.empty()) {
        tooltip = d3
          .select(svgRef.current.parentNode)
          .append('div')
          .attr('class', 'lineage-tooltip')
          .style('position', 'absolute')
          .style('pointer-events', 'none')
          .style('background', 'rgba(0,0,0,0.75)')
          .style('color', '#fff')
          .style('padding', '6px 8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('display', 'none');
        tooltipRef.current = tooltip.node();
      }

      const onMouseOver = function (event, d) {
        d3.select(this).attr('fill', '#ffb86b').attr('r', 12);
        tooltip
          .style('display', 'block')
          .html(`ID: ${d.id}<br/>ts: ${d.timestamp || 'n/a'}`)
          .style('left', `${event.pageX + 8}px`)
          .style('top', `${event.pageY + 8}px`);
      };

      const onMouseOut = function () {
        d3.select(this).attr('fill', '#7f5af0').attr('r', 8);
        tooltip.style('display', 'none');
      };

      // selection state toggles stroke on the circle
      const onSelect = function () {
        const el = d3.select(this);
        const currently = el.attr('data-selected') === 'true';
        const nextBool = !currently;
        const next = nextBool.toString();
        if (!multiSelect && nextBool) {
          // clear others
          svg.selectAll('circle').attr('data-selected', 'false').attr('stroke', null).attr('stroke-width', null);
        }
        el.attr('data-selected', next);
        void el.attr('stroke', nextBool ? '#ffd866' : null).attr('stroke-width', nextBool ? 3 : null);
        // call callback with (id, selected:boolean)
        try {
          const id = el.attr('id');
          if (typeof onSelectProp === 'function') onSelectProp(id, nextBool);
          // update selection list and call onSelectionChange
          const selected = [];
          svg.selectAll('circle').each(function () {
            const s = d3.select(this);
            if (s.attr('data-selected') === 'true') selected.push(s.attr('id'));
          });
          if (typeof onSelectionChange === 'function') onSelectionChange(selected);
          if (announceSelections && liveRef.current) {
            liveRef.current.textContent = selected.length ? `Selected: ${selected.join(', ')}` : 'No selection';
          }
        } catch (e) {
          // ignore
        }
      };

      const onKeyDown = function (event) {
        const isSpace = event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space' || event.key === 'Space';
        if (event.key === 'Enter' || isSpace) {
          event.preventDefault();
          onSelect.call(this);
        }
      };

      svg
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('id', (d) => d.id)
        .attr('class', 'lineage-node')
        .attr('r', 8)
        .attr('fill', '#7f5af0')
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', (d) => `node ${d.id}`)
        .attr('data-selected', 'false')
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseOut)
        .on('click', onSelect)
        .on('keydown', onKeyDown);

      svg
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('x', (d) => d.x + 10)
        .attr('y', (d) => d.y)
        .text((d) => d.id.slice(0, 8))
        .attr('font-size', '12px')
        .attr('fill', '#ffffff');
    };

    fetchAndRender();
  }, [userId, propNodes, onSelectProp, onSelectionChange, multiSelect, announceSelections]);

  // (resetKey prop removed) the preferred way to clear visuals is via the imperative ref API below

  // expose imperative clearSelection API
  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      const svg = d3.select(svgRef.current);
      if (svg.empty()) return;
      svg.selectAll('circle').attr('data-selected', 'false').attr('stroke', null).attr('stroke-width', null);
      if (typeof onSelectionChange === 'function') {
        try {
          onSelectionChange([]);
        } catch (e) {
          // ignore
        }
      }
      if (announceSelections && liveRef.current) {
        liveRef.current.textContent = 'No selection';
      }
    },
  }));

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={800} height={400} />
      <div
        ref={liveRef}
        aria-live="polite"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        No selection
      </div>
    </div>
  );
};

export const LineageMap = forwardRef(LineageMapInner);
