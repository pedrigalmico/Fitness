import { Component } from "react";

// Without a boundary, any uncaught render error unmounts the whole app
// into a blank black page. Show a reload screen instead.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0A0A12" }}>
        <div className="text-center">
          <p className="text-3xl mb-3">😵</p>
          <h1 className="text-base font-bold text-white mb-1">Something went wrong</h1>
          <p className="text-xs mb-4" style={{ color: "#555" }}>
            Your data is safe in the cloud. Reload to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FF6B35, #F59E0B)" }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
