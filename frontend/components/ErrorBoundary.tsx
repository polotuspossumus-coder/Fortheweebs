import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    // Optional: send to Sentry or backend
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh or contact support.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
