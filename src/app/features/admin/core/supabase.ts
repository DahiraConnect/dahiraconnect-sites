import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SUPABASE } from '../../../../environments/supabase';

/** Le back-office est-il relié à un projet Supabase ? */
export const supabaseConfigured = !!(SUPABASE.url && SUPABASE.anonKey);

let client: SupabaseClient | undefined;

/**
 * Client Supabase, créé à la demande.
 * Importé uniquement par le back-office : il n'alourdit pas le site public.
 */
export function supabase(): SupabaseClient {
  client ??= createClient(SUPABASE.url, SUPABASE.anonKey, {
    // Lien reçu par e-mail : la session arrive dans l'adresse (#access_token…).
    // Flux « implicit » : le lien marche même s'il s'ouvre dans un autre navigateur que la demande.
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
  });
  return client;
}

/** Ligne de table « document » : colonnes utiles + objet JSON du modèle */
export interface DocRow<T> {
  id: string;
  dahira_id: string;
  slug: string;
  data: T;
  updated_at: string;
}
