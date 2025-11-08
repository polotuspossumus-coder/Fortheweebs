import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

// SECURE: Only Jacob Morris - tied to phone number
const OWNER_PHONE_NUMBER = "+12813819498"; // Replace with YOUR actual phone number
const ADMIN_SECRET_KEY = "polotuspossumus_ftw_2025_owner";
const MAX_AUTHORIZED_DEVICES = 5; // Computer + Phone + 3 backups

// Generate device fingerprint
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
    deviceType: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
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

// Get list of authorized devices
function getAuthorizedDevices() {
  const devices = localStorage.getItem('authorized_devices');
  return devices ? JSON.parse(devices) : [];
}

// Add device to authorized list
function addAuthorizedDevice(deviceId, deviceInfo) {
  const devices = getAuthorizedDevices();

  // Check if already authorized
  if (devices.find(d => d.deviceId === deviceId)) {
    return true;
  }

  // Check max devices limit
  if (devices.length >= MAX_AUTHORIZED_DEVICES) {
    return false; // Too many devices
  }

  devices.push({
    deviceId,
    deviceType: deviceInfo.deviceType,
    addedAt: Date.now(),
    lastUsed: Date.now()
  });

  localStorage.setItem('authorized_devices', JSON.stringify(devices));
  return true;
}

// Check if device is authorized
function isDeviceAuthorized(deviceId) {
  const devices = getAuthorizedDevices();
  return devices.some(d => d.deviceId === deviceId);
}

export function AdminQRAuth({ onAuthSuccess }) {
  const [step, setStep] = useState(1); // 1=phone verify, 2=QR scan
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [showCode, setShowCode] = useState(false);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();

    // Normalize phone number - remove all non-digits then check
    const normalizedInput = phoneNumber.replace(/\D/g, '');
    const normalizedOwner = OWNER_PHONE_NUMBER.replace(/\D/g, '');

    // Check if phone number matches owner
    if (normalizedInput === normalizedOwner || normalizedInput === normalizedOwner.slice(1)) {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);
      setShowCode(true);

      setStep(2);
      setError("");
    } else {
      setError("❌ Phone number not authorized");
      setPhoneNumber("");
    }
  };

  const handleCodeVerify = (e) => {
    e.preventDefault();

    if (verificationCode === sentCode) {
      setStep(3); // Move to QR scan
      generateQRCode();
      startPolling();
      setError("");
    } else {
      setError("❌ Invalid verification code");
      setVerificationCode("");
    }
  };

  useEffect(() => {
    if (step === 3) {
      generateQRCode();
      startPolling();
    }
  }, [step]);

  const generateQRCode = async () => {
    const token = `ftw_admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setAuthToken(token);

    const authUrl = `${window.location.origin}/admin-verify?token=${token}&key=${ADMIN_SECRET_KEY}&phone=${encodeURIComponent(OWNER_PHONE_NUMBER)}`;

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
    const interval = setInterval(() => {
      const authData = localStorage.getItem('qr_auth_pending');
      if (authData) {
        try {
          const data = JSON.parse(authData);
          if (data.authenticated && data.deviceId && data.phoneNumber === OWNER_PHONE_NUMBER) {
            // Try to add device
            const added = addAuthorizedDevice(data.deviceId, {
              deviceType: data.deviceType || 'unknown'
            });

            if (added) {
              completeAuth(data.deviceId);
            } else {
              setError("❌ Maximum device limit reached (5 devices). Remove old devices first.");
              localStorage.removeItem('qr_auth_pending');
            }
          }
        } catch (e) {
          console.error('Auth parsing error:', e);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const completeAuth = (deviceId) => {
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminDeviceId', deviceId);
    localStorage.setItem('adminPhoneNumber', OWNER_PHONE_NUMBER);
    localStorage.removeItem('qr_auth_pending');
    onAuthSuccess();
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{
        background: '#222',
        padding: '50px',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        border: '3px solid #FFD700'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
            {step === 1 ? '📱' : step === 2 ? '🔢' : '📱'}
          </div>
          <h2 style={{ color: '#FFD700', margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>
            {step === 1 ? 'Phone Verification' : step === 2 ? 'Enter Code' : 'Scan QR Code'}
          </h2>
          <p style={{ color: '#aaa', marginTop: '12px', fontSize: '1rem' }}>
            {step === 1 ? 'Enter your registered phone number' : step === 2 ? 'Enter the verification code shown above' : 'Scan with your phone to authorize device'}
          </p>
        </div>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handlePhoneSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700', fontWeight: 600 }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #444',
                  background: '#333',
                  color: '#fff',
                  fontSize: '1.1rem',
                  outline: 'none'
                }}
                placeholder="+12813819498"
                autoFocus
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                color: '#fff',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Send Verification Code →
            </button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleCodeVerify}>
            {showCode && sentCode && (
              <div style={{
                background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                color: '#fff',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center',
                border: '3px solid #FFD700'
              }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>
                  Your Verification Code:
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '12px', fontFamily: 'monospace' }}>
                  {sentCode}
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.8 }}>
                  Enter this code below to continue
                </div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700', fontWeight: 600 }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #444',
                  background: '#333',
                  color: '#fff',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  outline: 'none'
                }}
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                color: '#fff',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Verify Code →
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setVerificationCode("");
                setError("");
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: '#888',
                border: '1px solid #444',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              ← Back
            </button>
          </form>
        )}

        {/* Step 3: QR Code Scan */}
        {step === 3 && qrCodeUrl && (
          <div>
            <div style={{
              background: '#FFD700',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '24px',
              display: 'inline-block',
              width: '100%',
              textAlign: 'center'
            }}>
              <img
                src={qrCodeUrl}
                alt="Admin QR Code"
                style={{
                  display: 'inline-block',
                  width: '300px',
                  height: '300px',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                ✅ Phone Verified!
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                Now scan this QR code with your phone camera
              </p>
            </div>

            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                color: '#fff',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '2px solid #333'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#888', textAlign: 'center', lineHeight: '1.6' }}>
                🔒 <strong style={{color: '#FFD700'}}>Multi-Device Support</strong><br/>
                This computer + your phone will both be authorized<br/>
                Maximum 5 devices total
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: '#4da6ff',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            ← Back to regular access
          </a>
        </div>
      </div>
    </div>
  );
}

// Verification handler for mobile
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
      const phoneNumber = params.get('phone');

      if (key !== ADMIN_SECRET_KEY) {
        setStatus("❌ Invalid authentication key");
        setVerifying(false);
        return;
      }

      if (phoneNumber !== OWNER_PHONE_NUMBER) {
        setStatus("❌ Unauthorized phone number");
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
        deviceType: fingerprint.deviceType,
        phoneNumber: phoneNumber,
        timestamp: Date.now(),
        token: token
      }));

      // ALSO authenticate this phone permanently
      const added = addAuthorizedDevice(deviceId, {
        deviceType: fingerprint.deviceType
      });

      if (added) {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminDeviceId', deviceId);
        localStorage.setItem('adminPhoneNumber', phoneNumber);
        setStatus("✅ Authenticated! Both devices are now authorized.");
      } else {
        setStatus("⚠️ Desktop authenticated, but phone device limit reached.");
      }

      setVerifying(false);

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/';
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

// Check if current device is authorized
export function checkAdminAuth() {
  const adminAuth = localStorage.getItem('adminAuthenticated');
  const deviceId = localStorage.getItem('adminDeviceId');
  const phoneNumber = localStorage.getItem('adminPhoneNumber');

  // Must be authenticated, have device ID, and phone number must match owner
  if (adminAuth !== 'true' || !deviceId || phoneNumber !== OWNER_PHONE_NUMBER) {
    return false;
  }

  // Check if this specific device is in the authorized list
  return isDeviceAuthorized(deviceId);
}

export function logoutAdmin() {
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('adminDeviceId');
  // Keep adminPhoneNumber and authorized_devices for re-login
  window.location.href = "/";
}

// Admin panel to manage authorized devices
export function ManageDevices() {
  const devices = getAuthorizedDevices();

  const removeDevice = (deviceId) => {
    const devices = getAuthorizedDevices();
    const updated = devices.filter(d => d.deviceId !== deviceId);
    localStorage.setItem('authorized_devices', JSON.stringify(updated));
    window.location.reload();
  };

  return (
    <div style={{ padding: '24px', background: '#222', borderRadius: '12px', color: '#fff' }}>
      <h3 style={{ color: '#FFD700', marginBottom: '16px' }}>Authorized Devices ({devices.length}/{MAX_AUTHORIZED_DEVICES})</h3>
      {devices.map((device, i) => (
        <div key={i} style={{
          background: '#333',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>
              {device.deviceType === 'mobile' ? '📱 Mobile' : '💻 Desktop'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>
              Added: {new Date(device.addedAt).toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={() => removeDevice(device.deviceId)}
            style={{
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
