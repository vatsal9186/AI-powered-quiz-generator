import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { apiBaseUrl } from './utils/api.js'

// Intercept all global fetch requests to automatically attach credentials: "include" for backend cookies
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (!config) {
    config = {};
  }
  
  const urlString = typeof resource === 'string' ? resource : (resource && resource.url) || "";
  
  if (
    urlString.startsWith(apiBaseUrl) ||
    urlString.startsWith('/api') ||
    urlString.startsWith('http://localhost:8000') ||
    urlString.startsWith('http://127.0.0.1:8000')
  ) {
    config.credentials = 'include';
  }
  
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
