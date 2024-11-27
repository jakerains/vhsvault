import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setupPWA } from './utils/pwa';
import '@fontsource/vt323';
import '@fontsource/press-start-2p';
import './styles/index.css';
import App from './App';

// Initialize PWA
setupPWA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);