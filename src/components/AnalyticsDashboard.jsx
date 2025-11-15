import React, { useState, useEffect } from 'react';
import { isOwner } from '../utils/ownerAuth';

export default function AnalyticsDashboard() {
  const [isOwnerUser, setIsOwnerUser] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersToday: 23,
    totalRevenue: 45678,
    avgSessionTime: '12m 34s',
    conversionRate: '3.4%'
  };

  const recentActivity = [
    { id: 1, action: 'New user signup', user: 'user_892', time: '2 minutes ago' },
    { id: 2, action: 'Premium upgrade', user: 'creator_45', time: '15 minutes ago' },
    { id: 3, action: 'Content published', user: 'artist_123', time: '1 hour ago' },
    { id: 4, action: 'Commission completed', user: 'creator_78', time: '3 hours ago' }
  ];

  useEffect(() => {
    const checkOwner = async () => {
      const ownerStatus = await isOwner();
      setIsOwnerUser(ownerStatus);
    };
    checkOwner();
  }, []);

  if (!isOwnerUser) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🔒 Owner Access Only</h2>
        <p style={{ color: '#6b7280' }}>This dashboard is restricted to the platform owner.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            📊 Analytics Dashboard
          </h1>
          <p style={{ opacity: 0.9 }}>
            Platform insights and metrics
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Total Users
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
            {stats.totalUsers.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            ↑ 12% from last {timeRange}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Active Users
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
            {stats.activeUsers.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            ↑ 8% from last {timeRange}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            New Today
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
            {stats.newUsersToday}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
            Signups today
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Total Revenue
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            ↑ 24% from last {timeRange}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Avg Session Time
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
            {stats.avgSessionTime}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            ↑ 5% from last {timeRange}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
            Conversion Rate
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
            {stats.conversionRate}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            ↑ 0.8% from last {timeRange}
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>
          Recent Activity
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentActivity.map(activity => (
            <div
              key={activity.id}
              style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{activity.action}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{activity.user}</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
