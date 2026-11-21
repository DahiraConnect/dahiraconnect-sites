import { Dahira } from '../models';

/** Dossier des icônes d'application d'un dahira (générées depuis son logo HD). */
export const tenantIconBase = (slug: string) => `/assets/tenants/${slug}/icons`;

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/**
 * Manifeste PWA propre à chaque dahira : nom, couleurs et icônes de son sous-domaine.
 * Servi par le serveur sur /manifest.webmanifest (voir server.ts).
 */
export function buildManifest(dahira: Dahira) {
  const icons = tenantIconBase(dahira.slug);
  const primary = dahira.theme['color-primary'] ?? '#0A3A1B';
  return {
    id: '/',
    name: dahira.name,
    short_name: titleCase(dahira.shortName),
    description: dahira.motto,
    lang: 'fr',
    dir: 'ltr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: primary,
    theme_color: primary,
    categories: ['lifestyle', 'social'],
    icons: [
      { src: `${icons}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${icons}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${icons}/maskable-192.png`, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: `${icons}/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Appui long sur l'icône (Android)
    shortcuts: [
      { name: 'Agenda', url: '/agenda', icons: [{ src: `${icons}/icon-192.png`, sizes: '192x192' }] },
      { name: 'Galerie', url: '/galerie', icons: [{ src: `${icons}/icon-192.png`, sizes: '192x192' }] },
      { name: 'Rejoindre', url: '/rejoindre', icons: [{ src: `${icons}/icon-192.png`, sizes: '192x192' }] },
    ],
  };
}
