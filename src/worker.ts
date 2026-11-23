/// <reference path="../worker-configuration.d.ts" />
import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { createSiteHandler, loadPublicSite } from './worker/public-site';
import type { TenantBundle } from './app/core/data/tenant-bundle';
import { buildIcs } from '../scripts/agenda-ics.mjs';

const angular = new AngularAppEngine();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const cache = await caches.open('site-public-v1');
    const handler = createSiteHandler({
      assets: (request) => env.ASSETS.fetch(request),
      render: (request, tenantBundle) => angular.handle(request, { tenantBundle }),
      calendar: (bundle) => buildIcs(bundle.dahira, bundle.events, bundle.dahira.siteUrl ?? ''),
      load: async (slug, request) => {
        // Une seule clé publique par hôte : site-publier peut l'invalider par URL.
        const cacheUrl = new URL('/api/site', request.url);
        if (cacheUrl.hostname === 'localhost' || cacheUrl.hostname === '127.0.0.1')
          cacheUrl.searchParams.set('tenant', slug);
        const key = new Request(cacheUrl, { method: 'GET' });
        const cached = await cache.match(key);
        if (cached) return cached.json() as Promise<TenantBundle>;
        const bundle = await loadPublicSite(slug, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        ctx.waitUntil(
          cache
            .put(
              key,
              new Response(JSON.stringify(bundle), {
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'public, max-age=120',
                },
              }),
            )
            .catch(() => console.error(JSON.stringify({ event: 'site-cache-write-failed', slug }))),
        );
        return bundle;
      },
    });
    return handler(request);
  },
} satisfies ExportedHandler<Env>;

// Contrat du serveur utilisé par Angular pendant la découverte des routes.
export const reqHandler = createRequestHandler((request: Request) => angular.handle(request));
