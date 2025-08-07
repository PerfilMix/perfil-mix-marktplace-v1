import { useEffect } from 'react';

export const usePreloader = () => {
  useEffect(() => {
    // Preload páginas críticas
    const preloadPages = [
      '/login',
      '/comprar',
      '/dashboard'
    ];

    preloadPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    // Preload imagens importantes
    const preloadImages = [
      'https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/PerfilMix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvUGVyZmlsTWl4LnBuZyIsImlhdCI6MTc1MDczMzY0NywiZXhwIjoyMDY2MDkzNjQ3fQ.xUA6g87KMF1QEzT86gICa2nRjK-X8LiYbHn2k-8xDDI'
    ];

    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    return () => {
      // Cleanup se necessário
      const links = document.querySelectorAll('link[rel="prefetch"]');
      links.forEach(link => link.remove());
    };
  }, []);
};