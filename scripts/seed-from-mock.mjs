// Génère supabase/seed.sql à partir des données de démo (src/assets/mock), pour la base commune
// Saa-Dahira (module site). Le site est rattaché à un dahira qui existe déjà dans cette base :
//   DAHIRA_NOM="Dahira Nourou Darayni" node scripts/seed-from-mock.mjs
// puis coller supabase/seed.sql dans l'éditeur SQL (ou psql sur la base locale).
import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(`src/assets/mock/${f}.json`, 'utf8'));
const json = (v) => `$json$${JSON.stringify(v)}$json$::jsonb`;
const text = (v) => `'${String(v).replaceAll("'", "''")}'`;

const nom = process.env.DAHIRA_NOM || 'Dahira Nourou Darayni';
const profile = read('tenant');
const events = read('events');
const albums = read('albums');
const dahiraId = `(select id from public.dahiras where nom = ${text(nom)} order by created_at limit 1)`;

const lines = [
  '-- Généré par scripts/seed-from-mock.mjs : ne pas modifier à la main.',
  `insert into public.sites (dahira_id, adresse, profil, contenu, bureau, quiz) values (${dahiraId}, ${text(profile.slug)}, ${json(profile)}, ${json(read('content'))}, ${json(read('board'))}, ${json(read('quiz'))});`,
  ...events.map(
    (e) =>
      `insert into public.site_evenements (dahira_id, slug, debut, data) values (${dahiraId}, ${text(e.slug)}, ${text(e.startsAt)}, ${json(e)});`,
  ),
  ...albums.map(
    (a) =>
      `insert into public.site_albums (dahira_id, slug, date, data) values (${dahiraId}, ${text(a.slug)}, ${text(a.date)}, ${json(a)});`,
  ),
];
writeFileSync('supabase/seed.sql', lines.join('\n') + '\n');
console.log(`seed.sql : site « ${profile.slug} » rattaché à « ${nom} », ${events.length} événements, ${albums.length} albums`);
