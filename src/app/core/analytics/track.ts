/**
 * Clé de statistique d'un clic, déduite du lien touché (aucune donnée personnelle).
 * Renvoie null pour les liens qui ne nous intéressent pas.
 */
export function clickKey(el: Element): string | null {
  const explicit = el.closest('[data-track]')?.getAttribute('data-track');
  if (explicit) return explicit;
  const href = el.closest('a[href]')?.getAttribute('href') ?? '';
  if (/^https:\/\/wa\.me\/\?/.test(href)) return 'partage_whatsapp';
  if (/^https:\/\/wa\.me\/\d/.test(href)) return 'rejoindre_whatsapp';
  if (/^https:\/\/chat\.whatsapp\.com\//.test(href)) return 'rejoindre_groupe';
  if (href.startsWith('tel:')) return 'appel';
  if (href.startsWith('data:text/calendar')) return 'ajout_agenda';
  if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(href)) return 'itineraire';
  const social = href.match(/^https:\/\/(?:www\.|m\.)?(tiktok|facebook|instagram|youtube|x|twitter)\.com/);
  if (social) return `reseau_${social[1]}`;
  return null;
}

/** Adresse de page → clé : '/agenda/ziar-2026/?x=1#a' → '/agenda/ziar-2026' */
export function viewKey(url: string): string | null {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase() || '/';
  if (path.startsWith('/admin')) return null;
  return /^[a-z0-9/_:.-]{1,120}$/.test(path) ? path : null;
}
