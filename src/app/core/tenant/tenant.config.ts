/** Domaine racine : chaque dahira a son sous-domaine `<slug>.dahiraconnect.sn`. */
export const ROOT_DOMAIN = 'dahiraconnect.sn';

/** Dahira servi en local / sur un domaine inconnu (pilote). */
export const DEFAULT_TENANT = 'moutahabina';

/**
 * Déduit le slug du dahira depuis l'URL :
 * 1. `?tenant=<slug>` (développement, aperçus) ;
 * 2. sous-domaine de `dahiraconnect.sn` ;
 * 3. dahira par défaut.
 */
export function resolveTenantSlug(url: URL): string {
  const fromQuery = url.searchParams.get('tenant');
  if (fromQuery && /^[a-z0-9-]+$/.test(fromQuery)) return fromQuery;

  const host = url.hostname.toLowerCase();
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, -(ROOT_DOMAIN.length + 1)).split('.').pop();
    if (sub && sub !== 'www') return sub;
  }
  return DEFAULT_TENANT;
}
