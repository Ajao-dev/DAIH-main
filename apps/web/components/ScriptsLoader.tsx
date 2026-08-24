'use client';

import { useEffect } from 'react';

export const ScriptsLoader = () => {
  useEffect(() => {
    const scripts = [
      '/js/jquery.min.js',
      '/js/bootstrap.bundle.min.js',
      '/js/wow.min.js',
      '/js/jquery.isotope.min.js',
      '/js/easing.js',
      '/js/owl.carousel.js',
      '/js/validation.js',
      '/js/jquery.magnific-popup.min.js',
      '/js/enquire.min.js',
      '/js/jquery.plugin.js',
      '/js/jquery.countTo.js',
      '/js/jquery.countdown.js',
      '/js/jquery.lazy.min.js',
      '/js/jquery.lazy.plugins.min.js',
      '/js/mdb.min.js',
      '/js/designesia.js',
    ];

    let current = 0;
    const loadNext = () => {
      if (current >= scripts.length) return;
      const src = scripts[current];
      current++;

      if (document.querySelector(`script[src="${src}"]`)) {
        loadNext();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = loadNext;
      script.onerror = loadNext;
      document.body.appendChild(script);
    };

    loadNext();
  }, []);

  return null;
};
