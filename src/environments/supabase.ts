/**
 * Back-office : projet Supabase en ligne.
 * L'URL et la clé « anon » sont publiques par nature (la sécurité repose sur les règles RLS).
 */
export const SUPABASE = {
  url: 'https://obrdjhhakqhcbttdbfek.supabase.co',
  anonKey: 'sb_publishable_SFwepiIrBtrLvyfm1NH6YA_h1V0cT4K',
};

/**
 * Cloudflare Turnstile (anti-robots) sur la connexion de l'admin.
 * Clé de site publique (Cloudflare > Turnstile) ; vide = pas de vérification.
 * La clé secrète correspondante se règle côté Supabase (Authentication > Attack Protection).
 */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAGNBCon2Y5PJL0LG';
