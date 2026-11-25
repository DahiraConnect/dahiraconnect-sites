import { RenderMode, ServerRoute } from '@angular/ssr';
import { MOCK_SOURCES } from './core/data/tenant-bundle';
import { hasLesson, hasParts, hasQuiz } from './core/models';
import { DEFAULT_TENANT } from './core/tenant/tenant.config';

const bundle = () => MOCK_SOURCES[DEFAULT_TENANT]();

/**
 * Site statique (Cloudflare Pages) : toutes les pages sont générées au build
 * pour le dahira par défaut, y compris chaque fiche événement et chaque album.
 *
 * Multi-dahira par sous-domaine (plus tard) : repasser en `RenderMode.Server`
 * et `outputMode: "server"` dans angular.json, avec un hébergement qui exécute
 * le serveur (Cloudflare Workers, Node).
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'agenda/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => (await bundle()).events.map((e) => ({ slug: e.slug })),
  },
  {
    path: 'galerie/:album',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => (await bundle()).albums.map((a) => ({ album: a.slug })),
  },
  {
    path: 'quiz/:theme',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ((await bundle()).quiz?.themes ?? []).filter(hasQuiz).map((t) => ({ theme: t.id })),
  },
  {
    path: 'apprendre/:theme',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ((await bundle()).quiz?.themes ?? []).filter((t) => hasLesson(t) || hasParts(t)).map((t) => ({ theme: t.id })),
  },
  // Back-office (phase 2) : rendu dans le navigateur, aucune page pré-générée
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  // Adresse inconnue : 404.html (copié par scripts/postbuild.mjs) puis rendu dans le navigateur
  { path: '**', renderMode: RenderMode.Prerender },
];
