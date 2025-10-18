import React, { useState, useEffect } from 'react';

const OverviewPanel = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        // Replace with your backend endpoint if available
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setStats({ error: err.message });
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Overview</h2>
      {stats ? (
        stats.error ? (
          <p style={{ color: 'red' }}>Error: {stats.error}</p>
        ) : (
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        )
      ) : (
        <p>Loading live stats...</p>
      )}
    </div>
  );
};

export default OverviewPanel;
