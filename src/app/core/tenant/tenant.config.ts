/** Domaine public des sites ; l'ancien domaine reste reconnu pendant la transition. */
export const ROOT_DOMAIN = 'akkili.sn';
export const DEFAULT_TENANT = 'moutahabina';

export function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/** Aucun repli vers le pilote pour une adresse publique inconnue. */
export function resolveTenantSlug(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (isLocalHost(host)) {
    const query = url.searchParams.get('tenant');
    return query && /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(query) ? query : DEFAULT_TENANT;
  }
  for (const domain of [ROOT_DOMAIN, 'dahiraconnect.sn']) {
    if (!host.endsWith(`.${domain}`)) continue;
    const slug = host.slice(0, -(domain.length + 1));
    return /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug) && slug !== 'www' ? slug : null;
  }
  return null;
}
