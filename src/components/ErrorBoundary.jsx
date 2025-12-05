import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#ff6b6b', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️ Oops!</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Something went wrong. Don't worry, you can report this!</p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '600px', textAlign: 'left' }}>
            <strong>Error Details:</strong>
            <pre style={{ fontSize: '0.9rem', marginTop: '10px', overflow: 'auto', maxHeight: '200px' }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '14px 32px', background: 'white', color: '#ff6b6b', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '600' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
