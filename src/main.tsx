import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { syncOfflineGrades } from './stores/reviewStore';
import './styles/variables.css';
import './styles/base.css';
import './styles/animations.css';

// Sync any queued offline review grades when coming back online
window.addEventListener('online', () => syncOfflineGrades());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
