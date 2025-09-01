import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/tokens.scss';
import './styles/base.scss';
import './styles/layout.scss';
import './styles/themes.scss';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
