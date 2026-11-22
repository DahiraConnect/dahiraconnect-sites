/** Supabase local (`supabase start`, ports décalés dans supabase/config.toml). */
export const SUPABASE = {
  url: 'http://127.0.0.1:56421',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
};

/** Turnstile désactivé en local (Supabase local ne vérifie pas le captcha). */
export const TURNSTILE_SITE_KEY = '';
