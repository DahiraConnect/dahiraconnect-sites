/**
 * Base commune DahiraConnect (projet Supabase « saa-dahira »), en ligne.
 * L'URL et la clé « anon » sont publiques par nature (la sécurité repose sur les règles RLS).
 */
export const SUPABASE = {
  url: 'https://smphfvfxwiiddhpwvcqk.supabase.co',
  anonKey: 'sb_publishable_HRTjrVPSRry6xWAP7WJ_kA_bYxA0H5j',
};

/**
 * Cloudflare Turnstile (anti-robots) sur la connexion de l'admin.
 * Clé de site publique (Cloudflare > Turnstile) ; vide = pas de vérification.
 * La clé secrète correspondante se règle côté Supabase (Authentication > Attack Protection).
 */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAGNBCon2Y5PJL0LG';
