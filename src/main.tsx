// Ensure window.fetch is writable and handle getter-only environments
try {
  let _fetch = window.fetch;
  const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (!desc || !desc.set) {
    Object.defineProperty(window, 'fetch', {
      get: () => _fetch,
      set: (val) => {
        _fetch = val;
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Ignored
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

