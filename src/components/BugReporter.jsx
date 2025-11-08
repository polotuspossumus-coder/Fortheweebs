import React, { useState } from 'react';

/**
 * BugReporter - Always-accessible bug reporting button
 * Users can report bugs which auto-create GitHub Issues
 * AI will attempt to fix them automatically
 */
export const BugReporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) {
      alert('Please fill in title and description');
      return;
    }

    setSubmitting(true);

    try {
      // Capture error context
      const errorContext = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {}),
      };

      const issueBody = `
## Bug Description
${description}

## Steps to Reproduce
${steps || 'Not provided'}

## Context
- **URL:** ${errorContext.url}
- **Browser:** ${errorContext.userAgent}
- **Time:** ${errorContext.timestamp}

## User Settings
\`\`\`json
${JSON.stringify(errorContext.localStorage, null, 2)}
\`\`\`

---
*Reported by user via in-app bug reporter*
`;

      // Submit to your API endpoint that creates GitHub issue
      const response = await fetch('/api/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body: issueBody,
          labels: ['bug', 'user-reported'],
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setTitle('');
          setDescription('');
          setSteps('');
        }, 3000);
      } else {
        alert('Failed to submit bug report. Please try again.');
      }
    } catch (error) {
      console.error('Bug report error:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Bug Report Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
          zIndex: 9999,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Report a Bug"
      >
        🐛
      </button>

      {/* Bug Report Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {!submitted ? (
              <>
                <h2 style={{ color: '#ff6b6b', marginBottom: '10px' }}>
                  🐛 Report a Bug
                </h2>
                <p style={{ color: '#666', marginBottom: '25px', fontSize: '0.9rem' }}>
                  Your report will be automatically reviewed and fixed by our AI system
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Bug Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    What went wrong? *
                  </label>
                  <textarea
                    placeholder="Describe what happened..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Steps to Reproduce (Optional)
                  </label>
                  <textarea
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: submitting ? '#ccc' : '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : '🚀 Submit Bug Report'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Report Submitted!</h3>
                <p style={{ color: '#666' }}>
                  Our AI will analyze and attempt to fix this bug automatically.
                  You'll be notified when it's resolved!
                </p>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#999',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
