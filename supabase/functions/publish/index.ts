// Republication du site d'un dahira après une modification dans le back-office.
// Vérifie que l'appelant gère bien ce dahira, puis appelle le crochet de déploiement Cloudflare Pages.
//
// Secrets (supabase secrets set …) :
//   DEPLOY_HOOK_<SLUG>  ex. DEPLOY_HOOK_MOUTAHABINA=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…
//   DEPLOY_HOOK_URL     crochet par défaut (un seul site)
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

  const { dahiraId } = await req.json().catch(() => ({}));
  if (typeof dahiraId !== 'string') return json({ error: 'dahiraId' }, 400);

  // Client « au nom de l'utilisateur » : les règles RLS ne renvoient que ses propres droits
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data } = await sb
    .from('dahira_admins')
    .select('dahira:dahiras(slug)')
    .eq('dahira_id', dahiraId)
    .maybeSingle();
  const slug = (data as { dahira?: { slug: string } } | null)?.dahira?.slug;
  if (!slug) return json({ error: 'forbidden' }, 403);

  const hook =
    Deno.env.get(`DEPLOY_HOOK_${slug.toUpperCase().replaceAll('-', '_')}`) ?? Deno.env.get('DEPLOY_HOOK_URL');
  if (!hook) return json({ published: false, reason: 'no-hook' });

  const res = await fetch(hook, { method: 'POST' });
  return json({ published: res.ok });
});
