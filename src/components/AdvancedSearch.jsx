import React, { useState } from 'react';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    category: 'all'
  });
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    // TODO: Connect to actual search API
    console.log('Searching for:', query, 'with filters:', filters);
    setResults([
      { id: 1, title: 'Sample Result 1', type: 'content', date: '2025-11-15' },
      { id: 2, title: 'Sample Result 2', type: 'user', date: '2025-11-14' },
      { id: 3, title: 'Sample Result 3', type: 'content', date: '2025-11-13' }
    ]);
  };

  return (
    <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>
        🔍 Advanced Search
      </h3>

      {/* Search Input */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search content, users, tags..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px' }}>
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Types</option>
            <option value="content">Content</option>
            <option value="user">Users</option>
            <option value="tag">Tags</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px' }}>
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px' }}>
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Categories</option>
            <option value="art">Art</option>
            <option value="music">Music</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        style={{
          padding: '10px 24px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem'
        }}
      >
        Search
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
            Results ({results.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map(result => (
              <div
                key={result.id}
                style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{result.title}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Type: {result.type} • Date: {result.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
