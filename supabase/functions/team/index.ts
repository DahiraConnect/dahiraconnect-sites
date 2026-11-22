// Invitation d'un responsable par un propriétaire du dahira.
// Crée le compte s'il n'existe pas (aucun e-mail envoyé : la personne se connecte ensuite
// sur /admin avec son adresse), puis lui donne le rôle demandé.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const { dahiraId, email, role, personId } = await req.json().catch(() => ({}));
  const address = String(email ?? '').trim().toLowerCase();
  if (typeof dahiraId !== 'string' || !/^\S+@\S+\.\S+$/.test(address) || !['owner', 'editor'].includes(role)) {
    return json({ error: 'invalid' }, 400);
  }

  const url = Deno.env.get('SUPABASE_URL')!;
  // L'appelant doit être propriétaire de ce dahira
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: isOwner } = await asUser.rpc('is_dahira_owner', { d: dahiraId });
  if (!isOwner) return json({ error: 'forbidden' }, 403);
  const { data: me } = await asUser.auth.getUser();

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let { data: userId } = await admin.rpc('find_user_id', { p_email: address });
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({ email: address, email_confirm: true });
    if (error || !data.user) return json({ error: 'create' }, 500);
    userId = data.user.id;
  }

  // Un propriétaire existant n'est jamais modifié par un autre (protection)
  const { data: existing } = await admin
    .from('dahira_admins')
    .select('role')
    .eq('dahira_id', dahiraId)
    .eq('user_id', userId)
    .maybeSingle();
  if (existing?.role === 'owner' && userId !== me.user?.id) return json({ error: 'owner_exists' }, 409);

  // Personne du bureau : doit exister dans le bureau de ce dahira
  let person: string | null = null;
  if (typeof personId === 'string' && personId) {
    const { data: d } = await admin.from('dahiras').select('board').eq('id', dahiraId).single();
    const people = ((d?.board as { people?: { id: string }[] } | null)?.people ?? []);
    if (!people.some((p) => p.id === personId)) return json({ error: 'person' }, 400);
    person = personId;
  }

  const { error } = await admin
    .from('dahira_admins')
    .upsert(
      { dahira_id: dahiraId, user_id: userId, role, ...(person ? { person_id: person } : {}) },
      { onConflict: 'dahira_id,user_id' },
    );
  if (error) return json({ error: 'save' }, 500);

  await admin.from('audit_log').insert({
    dahira_id: dahiraId,
    user_id: me.user?.id,
    user_email: me.user?.email,
    user_name: (me.user?.user_metadata?.name as string | undefined)?.trim() || null,
    action: 'team',
    entity: 'team',
    entity_id: userId,
    label: `a ajouté ${address} à l’équipe (${role === 'owner' ? 'propriétaire' : 'éditeur'})`,
  });
  return json({ ok: true });
});
