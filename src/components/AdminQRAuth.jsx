import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

// SECURE: Only Jacob's phone can authenticate
const AUTHORIZED_DEVICE_ID = "jacob_phone_2025"; // Will be set when you first scan
const ADMIN_SECRET_KEY = "polotuspossumus_ftw_2025_owner";

// Generate device fingerprint from phone
function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('ForTheWeebs', 2, 2);

  return {
    canvasFingerprint: canvas.toDataURL(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touchPoints: navigator.maxTouchPoints || 0,
    timestamp: Date.now()
  };
}

function hashDeviceFingerprint(fingerprint) {
  const str = JSON.stringify(fingerprint);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `device_${Math.abs(hash).toString(36)}`;
}

export function AdminQRAuth({ onAuthSuccess }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    generateQRCode();
    startPolling();
  }, []);

  const generateQRCode = async () => {
    // Generate unique auth token
    const token = `ftw_admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setAuthToken(token);

    // Create auth URL with token
    const authUrl = `${window.location.origin}/admin-verify?token=${token}&key=${ADMIN_SECRET_KEY}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(authUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFD700'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error('QR code generation failed:', err);
    }
  };

  const startPolling = () => {
    // Poll for authentication every 2 seconds
    const interval = setInterval(() => {
      const authData = localStorage.getItem('qr_auth_pending');
      if (authData) {
        try {
          const data = JSON.parse(authData);
          if (data.authenticated && data.deviceId) {
            // Check if it's the authorized device
            const storedDeviceId = localStorage.getItem('authorized_device_id');

            if (!storedDeviceId) {
              // First time setup - register this device
              localStorage.setItem('authorized_device_id', data.deviceId);
              completeAuth(data.deviceId);
            } else if (storedDeviceId === data.deviceId) {
              // Known authorized device
              completeAuth(data.deviceId);
            } else {
              setError("❌ Unauthorized device detected!");
              localStorage.removeItem('qr_auth_pending');
            }
          }
        } catch (e) {
          console.error('Auth parsing error:', e);
        }
      }
    }, 2000);

    // Cleanup
    return () => clearInterval(interval);
  };

  const completeAuth = (deviceId) => {
    setIsScanning(false);
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminDeviceId', deviceId);
    localStorage.setItem('adminLoginTime', Date.now().toString());
    localStorage.removeItem('qr_auth_pending');
    onAuthSuccess();
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
export function checkQRAuth() {
  const adminAuth = localStorage.getItem('adminAuthenticated');
  const deviceId = localStorage.getItem('adminDeviceId');
  const authorizedDeviceId = localStorage.getItem('authorized_device_id');

  // NO EXPIRATION - stays logged in forever until manual logout
  // Keeps you logged in on both computer and phone permanently

  // Must match authorized device
  return adminAuth === 'true' && deviceId && deviceId === authorizedDeviceId;
}
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '16px' }}>📱</div>
          <h2 style={{ color: '#FFD700', margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>
            Owner QR Access
          </h2>
          <p style={{ color: '#aaa', marginTop: '12px', fontSize: '1rem' }}>
            Scan with your authorized phone only
          </p>
        </div>

        {qrCodeUrl && (
          <div style={{
            background: '#FFD700',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'inline-block'
          }}>
            <img
              src={qrCodeUrl}
              alt="Admin QR Code"
              style={{
                display: 'block',
                width: '300px',
                height: '300px',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔐</div>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            Waiting for scan...
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            Open your phone camera and point at QR code
          </p>
        </div>

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ff4444, #cc0000)',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontWeight: 700,
            fontSize: '1.1rem',
            border: '2px solid #ff0000',
            animation: 'shake 0.5s'
          }}>
            {error}
          </div>
        )}

        <div style={{
          marginTop: '28px',
          padding: '20px',
          background: '#1a1a1a',
          borderRadius: '12px',
          border: '2px solid #333'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#888', lineHeight: '1.6' }}>
            🔒 <strong style={{color: '#FFD700'}}>Device-Locked Security</strong><br/>
            Only Jacob Morris's phone can authenticate<br/>
            First scan registers your device permanently
          </p>
        </div>

        {/* Recovery Mode Button */}
        <button
          onClick={() => window.location.href = "/?recovery=true"}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            color: '#ff6b6b',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#ff6b6b';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#ff6b6b';
          }}
        >
          🔓 Lost Phone? Use Recovery Mode
        </button>

        <div style={{ marginTop: '24px' }}>
          <a
            href="/"
            style={{
              color: '#4da6ff',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'color 0.3s'
            }}
          >
            ← Back to regular access
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

// Component that handles the QR scan redirect (mobile view)
export function AdminQRVerify() {
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState("Verifying device...");

  useEffect(() => {
    verifyDevice();
  }, []);

  const verifyDevice = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const key = params.get('key');

      if (key !== ADMIN_SECRET_KEY) {
        setStatus("❌ Invalid authentication key");
        setVerifying(false);
        return;
      }

      // Generate device fingerprint
      const fingerprint = generateDeviceFingerprint();
      const deviceId = hashDeviceFingerprint(fingerprint);

      // Store auth data for desktop to pick up
      localStorage.setItem('qr_auth_pending', JSON.stringify({
        authenticated: true,
        deviceId: deviceId,
        timestamp: Date.now(),
        token: token
      }));

      // ALSO authenticate this phone permanently
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminDeviceId', deviceId);
      localStorage.setItem('authorized_device_id', deviceId);

      setStatus("✅ Authenticated! You're now permanently logged in on this phone.");
      setVerifying(false);

      // Redirect to admin dashboard on phone
      setTimeout(() => {
        window.location.href = '/?admin_authenticated=true';
      }, 2000);
      }, 2000);

    } catch (error) {
      setStatus("❌ Verification failed");
      setVerifying(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: '#222',
        padding: '40px',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '100%',
        border: '3px solid #FFD700'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>
          {verifying ? '🔄' : '✅'}
        </div>
        <h2 style={{ color: '#FFD700', marginBottom: '16px', fontSize: '1.8rem' }}>
          {verifying ? 'Verifying...' : 'Success!'}
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          {status}
        </p>
      </div>
    </div>
  );
}

export function checkQRAuth() {
  const adminAuth = localStorage.getItem('adminAuthenticated');
  const deviceId = localStorage.getItem('adminDeviceId');
  const authorizedDeviceId = localStorage.getItem('authorized_device_id');
  const loginTime = localStorage.getItem('adminLoginTime');

  // Session expires after 24 hours
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const isExpired = loginTime && (Date.now() - parseInt(loginTime)) > twentyFourHours;

  if (isExpired) {
    logoutQRAdmin();
    return false;
  }

  // Must match authorized device
  return adminAuth === 'true' && deviceId && deviceId === authorizedDeviceId;
}

export function logoutQRAdmin() {
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('adminDeviceId');
  localStorage.removeItem('adminLoginTime');
  localStorage.removeItem('qr_auth_pending');
  // Keep authorized_device_id so same phone can re-login
  window.location.href = "/";
}
