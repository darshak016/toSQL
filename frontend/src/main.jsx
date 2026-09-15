import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';

// Catch any unhandled window errors
window.addEventListener('error', (e) => {
  console.error('Unhandled runtime error:', e.error || e.message);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}


