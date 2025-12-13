import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, deviceId: navigator.userAgent }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminEmail", data.email);
        localStorage.setItem("adminRole", data.role);
        localStorage.setItem("adminLoginTime", Date.now().toString());
        onLoginSuccess();
      } else {
        setError(data.error || "❌ Invalid admin credentials");
      }
    } catch (err) {
      setError("❌ Connection error. Is the backend running?");
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff'
    }}>
      <div style={{
        background: '#222',
        padding: '50px',
        borderRadius: '16px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        border: '2px solid #FFD700'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ color: '#FFD700', margin: 0, fontSize: '2rem', fontWeight: 700 }}>
            Admin Access
          </h2>
          <p style={{ color: '#aaa', marginTop: '12px', fontSize: '0.95rem' }}>
            ForTheWeebs Owner Portal
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '2px solid #444',
                background: '#333',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFD700'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
              placeholder="polotuspossumus@gmail.com"
              autoFocus
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
            No password required - JWT authentication via backend
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #ff4444, #cc0000)',
              color: '#fff',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 600,
              border: '2px solid #ff0000'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#666' : 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: loading ? '#aaa' : '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.4)';
              }
            }}
          >
            {loading ? '⏳ Authenticating...' : '🚀 Login as Owner'}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: '#4da6ff',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#80c0ff'}
            onMouseLeave={(e) => e.target.style.color = '#4da6ff'}
          >
            ← Back to regular user access
          </a>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
            🔒 Secure access for Jacob Morris only<br/>
            Unauthorized access attempts are logged
          </p>
        </div>
      </div>
    </div>
  );
}

export function checkAdminAuth() {
  const token = localStorage.getItem("adminToken");
  const email = localStorage.getItem("adminEmail");
  const loginTime = localStorage.getItem("adminLoginTime");

  // Session expires after 24 hours
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const isExpired = loginTime && (Date.now() - parseInt(loginTime)) > twentyFourHours;

  if (isExpired) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminLoginTime");
    return false;
  }

  return token && email;
}

export function logoutAdmin() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminEmail");
  localStorage.removeItem("adminRole");
  localStorage.removeItem("adminLoginTime");
  window.location.href = "/";
}

export function getAdminToken() {
  return localStorage.getItem("adminToken");
}
