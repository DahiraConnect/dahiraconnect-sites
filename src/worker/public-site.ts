import type { TenantBundle } from '../app/core/data/tenant-bundle';
import { resolveTenantSlug } from '../app/core/tenant/tenant.config';
import { buildManifest } from '../app/core/tenant/manifest';
import { hasLesson, hasParts, hasQuiz } from '../app/core/models/quiz.model';

export class SiteUnavailable extends Error {
  constructor(readonly status: number) {
    super('Site indisponible');
  }
}

/** Lecture anonyme : les règles RLS restent applicables, aucun jeton visiteur transmis. */
export async function loadPublicSite(
  slug: string,
  supabaseUrl: string,
  publicKey: string,
  fetcher: typeof fetch = fetch,
): Promise<TenantBundle> {
  const get = async <T>(table: string, params: Record<string, string>): Promise<T[]> => {
    const url = new URL(`/rest/v1/${table}`, supabaseUrl);
    url.search = new URLSearchParams(params).toString();
    const response = await fetcher(url, {
      headers: { apikey: publicKey },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new SiteUnavailable(503);
    return response.json() as Promise<T[]>;
  };
  type Site = {
    dahira_id: string;
    profil: TenantBundle['dahira'];
    contenu: TenantBundle['content'];
    bureau: TenantBundle['board'];
    quiz?: TenantBundle['quiz'];
  };
  const [site] = await get<Site>('sites', {
    adresse: `eq.${slug}`,
    en_ligne: 'eq.true',
    select: 'dahira_id,profil,contenu,bureau,quiz',
    limit: '1',
  });
  if (!site) throw new SiteUnavailable(404);
  type EventRow = { id: string; slug: string; data: TenantBundle['events'][number] };
  type AlbumRow = { id: string; slug: string; data: TenantBundle['albums'][number] };
  const [events, albums] = await Promise.all([
    get<EventRow>('site_evenements', {
      dahira_id: `eq.${site.dahira_id}`,
      select: 'id,slug,data',
      order: 'debut',
    }),
    get<AlbumRow>('site_albums', {
      dahira_id: `eq.${site.dahira_id}`,
      select: 'id,slug,data',
      order: 'date.desc',
    }),
  ]);
  return {
    dahira: { ...site.profil, slug, siteUrl: `https://${slug}.akkili.sn` },
    content: site.contenu,
    board: site.bureau,
    ...(site.quiz ? { quiz: site.quiz } : {}),
    events: events.map((e) => ({ ...e.data, id: e.data.id ?? e.id, slug: e.slug })),
    albums: albums.map((a) => ({ ...a.data, id: a.data.id ?? a.id, slug: a.slug })),
  };
}

const escapeXml = (text: string) =>
  text.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );

export function siteSitemap(bundle: TenantBundle): string {
  const paths = [
    '/',
    '/agenda/',
    '/galerie/',
    '/le-dahira/',
    '/le-dahira/notre-guide/',
    '/le-dahira/bureau/',
    '/le-dahira/charte/',
    '/rejoindre/',
    '/mentions-legales/',
    '/confidentialite/',
    '/apprendre/',
    ...bundle.events.map((e) => `/agenda/${encodeURIComponent(e.slug)}/`),
    ...bundle.albums.map((a) => `/galerie/${encodeURIComponent(a.slug)}/`),
    ...(bundle.quiz?.themes ?? []).filter((t) => hasLesson(t) || hasParts(t)).map((t) => `/apprendre/${encodeURIComponent(t.id)}/`),
    ...(bundle.quiz?.themes ?? []).filter(hasQuiz).map((t) => `/quiz/${encodeURIComponent(t.id)}/`),
  ];
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths
      .map((path) => `  <url><loc>${escapeXml(bundle.dahira.siteUrl + path)}</loc></url>`)
      .join('\n') +
    '\n</urlset>\n'
  );
}

export interface SiteHandlerDependencies {
  load(slug: string, request: Request): Promise<TenantBundle>;
  render(request: Request, bundle: TenantBundle): Promise<Response | null>;
  assets(request: Request): Promise<Response>;
  calendar(bundle: TenantBundle): string;
}

/** Le rendu HTML reste privé au cache : seul /api/site est mis en cache côté Worker. */
export function createSiteHandler(deps: SiteHandlerDependencies) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (!['GET', 'HEAD'].includes(request.method))
      return new Response(null, {
        status: 405,
        headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
      });
    // Aucun HTML pré-généré ou JSON de démonstration ne peut contourner la sélection du site.
    const asset =
      /^\/(?:assets\/(?!mock\/)|(?:chunk|main|polyfills|styles)-[\w.-]+\.(?:js|css)(?:\.map)?$|(?:ngsw-worker|safety-worker|worker-basic.min)\.js$|favicon\.ico$)/.test(
        url.pathname,
      );
    if (asset) return deps.assets(request);
    const slug = resolveTenantSlug(url);
    if (!slug) return unavailable(404, request.method);
    try {
      const bundle = await deps.load(slug, request);
      let response: Response | null;
      const text = (value: string, type: string) =>
        new Response(value, { headers: { 'Content-Type': `${type}; charset=utf-8` } });
      switch (url.pathname) {
        case '/api/site':
          response = text(JSON.stringify(bundle), 'application/json');
          break;
        case '/manifest.webmanifest':
          response = text(
            JSON.stringify(buildManifest(bundle.dahira)),
            'application/manifest+json',
          );
          break;
        case '/sitemap.xml':
          response = text(siteSitemap(bundle), 'application/xml');
          break;
        case '/robots.txt':
          response = text(
            `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${bundle.dahira.siteUrl}/sitemap.xml\n`,
            'text/plain',
          );
          break;
        case '/agenda.ics':
          response = text(deps.calendar(bundle), 'text/calendar');
          break;
        // Les anciennes installations doivent abandonner leur manifeste statique.
        case '/ngsw.json':
          return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
        default:
          if (/\.(?:html|json|xml|webmanifest|ics)$/.test(url.pathname))
            return unavailable(404, request.method);
          response = await deps.render(request, bundle);
      }
      if (!response) return unavailable(404, request.method);
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'no-store');
      return new Response(request.method === 'HEAD' ? null : response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      const status = error instanceof SiteUnavailable ? error.status : 503;
      if (status !== 404)
        console.error(JSON.stringify({ event: 'site-request-failed', slug, status }));
      return unavailable(status, request.method);
    }
  };
}

function unavailable(status: number, method: string): Response {
  const title =
    status === 404 ? 'Ce site n’est pas disponible' : 'Le site est momentanément indisponible';
  return new Response(
    method === 'HEAD'
      ? null
      : `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${title}</title><body><main><h1>${title}</h1><p>Veuillez réessayer plus tard.</p></main></body></html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        ...(status === 503 ? { 'Retry-After': '60' } : {}),
      },
    },
  );
}
