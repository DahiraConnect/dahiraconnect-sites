import { RenderMode, ServerRoute } from '@angular/ssr';

/** Le contenu est chargé pour chaque sous-domaine, sans génération par dahira. */
export const serverRoutes: ServerRoute[] = [
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
