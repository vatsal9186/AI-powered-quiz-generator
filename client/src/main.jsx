import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { apiBaseUrl } from './utils/api.js'

// Intercept all global fetch requests to automatically attach credentials: "include" and Authorization header
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (!config) {
    config = {};
  }
  
  const urlString = typeof resource === 'string' ? resource : (resource && resource.url) || "";
  
  if (
    (apiBaseUrl && urlString.startsWith(apiBaseUrl)) ||
    urlString.startsWith('/api') ||
    urlString.startsWith('http://localhost:8000') ||
    urlString.startsWith('http://127.0.0.1:8000')
  ) {
    config.credentials = 'include';

    const token =
      sessionStorage.getItem("questai_token") ||
      localStorage.getItem("questai_token");
    if (token && token.startsWith("ey")) {
      const existingHeaders = config.headers || {};
      if (existingHeaders instanceof Headers) {
        if (!existingHeaders.has("Authorization")) {
          existingHeaders.set("Authorization", `Bearer ${token}`);
        }
      } else if (Array.isArray(existingHeaders)) {
        const hasAuth = existingHeaders.some(([k]) => k.toLowerCase() === "authorization");
        if (!hasAuth) {
          config.headers = [...existingHeaders, ["Authorization", `Bearer ${token}`]];
        }
      } else {
        if (!existingHeaders["Authorization"] && !existingHeaders["authorization"]) {
          config.headers = {
            ...existingHeaders,
            Authorization: `Bearer ${token}`,
          };
        }
      }
    }
  }
  
  return originalFetch(resource, config);
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled UI error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d1117",
          color: "#f0f6fc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "24px", marginBottom: "12px", color: "#ff7b72" }}>
            Something went wrong
          </h2>
          <p style={{ maxWidth: "500px", color: "#8b949e", marginBottom: "24px", lineHeight: "1.6" }}>
            An unexpected interface error occurred. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              backgroundColor: "#238636",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
