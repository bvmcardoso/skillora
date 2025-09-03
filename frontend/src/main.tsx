import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import './styles/tokens.scss';
import './styles/base.scss';
import './styles/layout.scss';
import './styles/themes.scss';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </StrictMode>
);
