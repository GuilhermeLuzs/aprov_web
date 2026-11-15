import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import '@fontsource/archivo/600.css';
import '@fontsource/archivo/600-italic.css';
import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/archivo/800-italic.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/400-italic.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import './theme/theme.css';
import { AppRoutes } from './navigation/AppRoutes';
import { queryClient } from './queries/client';
import { restoreSession } from './store/session';

void restoreSession();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  </StrictMode>,
);
