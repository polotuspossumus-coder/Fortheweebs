import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError
      ? <div>Something went wrong. Please try again later.</div>
      : this.props.children;
  }
}

export default ErrorBoundary;
