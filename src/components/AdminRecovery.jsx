import React, { useState } from "react";

// MASTER RECOVERY CREDENTIALS - Use if phone is lost/broken
const MASTER_RECOVERY_PASSWORD = "jacobmorris_fortheweebs_owner_recovery_2025";
const BACKUP_EMAIL = "your-backup-email@example.com"; // Change this to your real backup email

const SECURITY_QUESTIONS = [
  { question: "What is your full legal name?", answer: "jacob morris" },
  { question: "What is the name of your platform?", answer: "fortheweebs" },
  { question: "What is your creator alias?", answer: "polotus possumus" }
];

export function AdminRecovery({ onRecoverySuccess }) {
  const [step, setStep] = useState(1);
  const [masterPassword, setMasterPassword] = useState("");
  const [answers, setAnswers] = useState(["", "", ""]);
  const [error, setError] = useState("");

  const handleMasterPasswordSubmit = (e) => {
    e.preventDefault();
    if (masterPassword === MASTER_RECOVERY_PASSWORD) {
      setStep(2);
      setError("");
    } else {
      setError("❌ Invalid master recovery password");
      setMasterPassword("");
    }
  };

  const handleSecurityQuestionsSubmit = (e) => {
    e.preventDefault();

    // Check all answers (case insensitive)
    const allCorrect = SECURITY_QUESTIONS.every((q, i) =>
      answers[i].toLowerCase().trim() === q.answer.toLowerCase()
    );

    if (allCorrect) {
      // Generate new device ID for this device
      const newDeviceId = `recovery_device_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Clear old device authorization
      localStorage.removeItem('authorized_device_id');

      // Set new authorization
      localStorage.setItem('authorized_device_id', newDeviceId);
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminDeviceId', newDeviceId);
      localStorage.setItem('recoveryUsed', Date.now().toString());

      onRecoverySuccess();
    } else {
      setError("❌ One or more security answers are incorrect");
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
      padding: '20px'
    }}>
      <div style={{
        background: '#222',
        padding: '50px',
        borderRadius: '20px',
        maxWidth: '550px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        border: '3px solid #ff6b6b'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🔓</div>
          <h2 style={{ color: '#ff6b6b', margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>
            Account Recovery
          </h2>
          <p style={{ color: '#aaa', marginTop: '12px', fontSize: '1rem' }}>
            Recover admin access if phone is lost/broken
          </p>
        </div>

        {/* Step 1: Master Password */}
        {step === 1 && (
          <form onSubmit={handleMasterPasswordSubmit}>
            <div style={{
              background: '#1a1a1a',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '2px solid #ff6b6b'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#ff6b6b', fontWeight: 600, lineHeight: '1.6' }}>
                ⚠️ <strong>WARNING:</strong> Recovery mode resets device authorization.<br/>
                Your old phone will be logged out.<br/>
                This device will become the new authorized device.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ff6b6b', fontWeight: 600, fontSize: '1.1rem' }}>
                Master Recovery Password
              </label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
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
                onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                onBlur={(e) => e.target.style.borderColor = '#444'}
                placeholder="Enter master recovery password"
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
                fontWeight: 600,
                border: '2px solid #ff0000'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 107, 107, 0.4)'
              }}
            >
              Continue to Security Questions →
            </button>
          </form>
        )}

        {/* Step 2: Security Questions */}
        {step === 2 && (
          <form onSubmit={handleSecurityQuestionsSubmit}>
            <div style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '2px solid #FFD700'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#FFD700', textAlign: 'center', fontWeight: 600 }}>
                ✓ Master password verified<br/>
                Answer all security questions to complete recovery
              </p>
            </div>

            {SECURITY_QUESTIONS.map((q, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700', fontWeight: 600 }}>
                  Question {index + 1}: {q.question}
                </label>
                <input
                  type="text"
                  value={answers[index]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '2px solid #444',
                    background: '#333',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                  onBlur={(e) => e.target.style.borderColor = '#444'}
                  placeholder="Enter your answer"
                  autoFocus={index === 0}
                  required
                />
              </div>
            ))}

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
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)'
              }}
            >
              🔓 Recover Admin Access
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setAnswers(["", "", ""]);
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
              ← Back to Master Password
            </button>
          </form>
        )}

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', textAlign: 'center', lineHeight: '1.6' }}>
            🔒 <strong style={{color: '#ff6b6b'}}>Emergency Recovery Only</strong><br/>
            Use only if your authorized phone is lost, stolen, or broken<br/>
            This will deauthorize your old device<br/>
            Keep your master password secure
          </p>
        </div>

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
            ← Back to QR login
          </a>
        </div>
      </div>
    </div>
  );
}

// Add recovery option to main QR auth screen
export function RecoveryButton({ onClick }) {
  return (
    <button
      onClick={onClick}
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
        marginTop: '16px',
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
  );
}
