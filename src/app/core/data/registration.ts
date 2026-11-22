import { SUPABASE } from '../../../environments/supabase';

export interface RegistrationStatus {
  open: boolean;
  reason?: 'closed' | 'full' | 'disabled' | 'unknown' | null;
  closesAt?: string;
  remaining?: number | null;
}

export type RegisterResult = 'ok' | 'duplicate' | 'closed' | 'full' | 'invalid' | 'disabled' | 'unknown' | 'error';

async function rpc<T>(fn: string, body: object): Promise<T> {
  const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE.anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${fn} : HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/** Les inscriptions sont-elles ouvertes en ce moment ? (lu au chargement de la page) */
export const registrationStatus = (dahira: string, event: string) =>
  rpc<RegistrationStatus>('site_etat_inscriptions', { p_adresse: dahira, p_evenement: event });

/** Inscription « Je viens » depuis le site public */
export async function register(
  dahira: string,
  event: string,
  person: { first: string; last: string; phone?: string; people?: number },
): Promise<RegisterResult> {
  try {
    const { status } = await rpc<{ status: RegisterResult }>('site_inscrire', {
      p_adresse: dahira,
      p_evenement: event,
      p_prenom: person.first,
      p_nom: person.last,
      p_telephone: person.phone || null,
      p_personnes: person.people ?? 1,
    });
    return status;
  } catch {
    return 'error';
  }
}
