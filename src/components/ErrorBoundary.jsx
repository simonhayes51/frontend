import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null, showDetails: false, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep the component stack so we can display it
    this.setState({ info });
    // Still log to console for dev tools
    console.error('Error caught by boundary:', error, info);
  }

  copyDetails = async () => {
    const { error, info } = this.state;
    const payload = [
      `Message: ${error?.message || String(error)}`,
      `Stack: ${error?.stack || '(no stack)'}`,
      `Component Stack: ${info?.componentStack || '(no component stack)'}`,
      `Path: ${window.location.pathname}${window.location.search}`,
      `UA: ${navigator.userAgent}`
    ].join('\n\n');
    try {
      await navigator.clipboard.writeText(payload);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 1500);
    } catch {}
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, info, showDetails, copied } = this.state;
    const message = error?.message || String(error || 'Unknown error');

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-4">We apologise for the inconvenience.</p>

          {/* Show the actual error message so you can see it on mobile */}
          <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-left text-sm mb-4">
            <p className="font-semibold mb-1">Error</p>
            <pre className="whitespace-pre-wrap break-words">{message}</pre>
          </div>

          {/* Toggle details (stack + component stack) */}
          <button
            onClick={() => this.setState({ showDetails: !showDetails })}
            className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded text-sm mb-3 w-full"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>

          {showDetails && (
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-left text-xs mb-4">
              <p className="font-semibold mb-1">Stack</p>
              <pre className="whitespace-pre-wrap break-words mb-2">{error?.stack || '(no stack)'}</pre>
              <p className="font-semibold mb-1">Component Stack</p>
              <pre className="whitespace-pre-wrap break-words">{info?.componentStack || '(no component stack)'}</pre>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Refresh Page
            </button>
            <button
              onClick={this.copyDetails}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded"
            >
              {copied ? 'Copied ✓' : 'Copy Error'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;