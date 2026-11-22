// Avant le build : récupère le contenu du dahira depuis Supabase et réécrit src/assets/mock/*.json.
// Le site reste entièrement pré-généré (rapide en 3G, bien référencé) ; le back-office
// déclenche un nouveau build après chaque modification.
//
// Variables d'environnement (Cloudflare Pages > Settings > Variables) :
//   SUPABASE_URL       https://<projet>.supabase.co
//   SUPABASE_ANON_KEY  clé publique (lecture seule grâce aux règles RLS)
//   DAHIRA_SLUG        facultatif, 'moutahabina' par défaut
// Sans ces variables, les fichiers JSON du dépôt sont utilisés tels quels.
import { writeFileSync } from 'node:fs';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const slug = process.env.DAHIRA_SLUG || 'moutahabina';

if (!url || !key) {
  // Build de production sur Cloudflare (branche main) : jamais de données de démo en ligne
  if (process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH === 'main') {
    console.error('pull-content : SUPABASE_URL / SUPABASE_ANON_KEY manquants pour la production. Build arrêté.');
    process.exit(1);
  }
  console.log('pull-content : Supabase non configuré, contenu du dépôt utilisé.');
  process.exit(0);
}

async function get(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${path} : HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const [dahira] = await get(`dahiras?slug=eq.${encodeURIComponent(slug)}&select=id,profile,content,board,quiz`);
if (!dahira) throw new Error(`pull-content : dahira « ${slug} » introuvable dans Supabase`);

const events = await get(`events?dahira_id=eq.${dahira.id}&select=id,slug,data&order=starts_at`);
const albums = await get(`albums?dahira_id=eq.${dahira.id}&select=id,slug,data&order=date.desc`);

const write = (name, value) =>
  writeFileSync(`src/assets/mock/${name}.json`, JSON.stringify(value, null, 2) + '\n');

write('tenant', dahira.profile);
write('content', dahira.content);
write('board', dahira.board);
if (dahira.quiz) write('quiz', dahira.quiz);
write('events', events.map((e) => ({ ...e.data, id: e.data.id ?? e.id, slug: e.slug })));
write('albums', albums.map((a) => ({ ...a.data, id: a.data.id ?? a.id, slug: a.slug })));

console.log(`pull-content : « ${slug} » — ${events.length} événements, ${albums.length} albums.`);
