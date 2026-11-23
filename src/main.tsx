import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import './viewer.css';

const root = document.getElementById('iphone-lab-app');

if (root) {
  const Viewer = lazy(() => import('./IphoneViewer'));
  const app = createRoot(root);
  const loadViewer = () => {
    root.closest('.iphone-lab')?.classList.add('visible');
    app.render(<React.StrictMode><Suspense fallback={<p className="viewer-status">Preparando o visualizador 3D…</p>}><Viewer /></Suspense></React.StrictMode>);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      loadViewer();
    }, { rootMargin: '400px' });
    observer.observe(root);
  } else {
    loadViewer();
  }
}
