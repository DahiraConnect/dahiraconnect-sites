// Génère supabase/seed.sql à partir des données de démo (src/assets/mock).
// Sert à remplir une base neuve : `node scripts/seed-from-mock.mjs` puis `supabase db reset`
// (local) ou coller le fichier dans l'éditeur SQL de Supabase (en ligne).
import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(`src/assets/mock/${f}.json`, 'utf8'));
const json = (v) => `$json$${JSON.stringify(v)}$json$::jsonb`;
const text = (v) => `'${String(v).replaceAll("'", "''")}'`;

const profile = read('tenant');
const events = read('events');
const albums = read('albums');
const dahiraId = `(select id from public.dahiras where slug = ${text(profile.slug)})`;

const lines = [
  '-- Généré par scripts/seed-from-mock.mjs : ne pas modifier à la main.',
  `insert into public.dahiras (slug, profile, content, board, quiz) values (${text(profile.slug)}, ${json(profile)}, ${json(read('content'))}, ${json(read('board'))}, ${json(read('quiz'))});`,
  ...events.map(
    (e) =>
      `insert into public.events (dahira_id, slug, starts_at, data) values (${dahiraId}, ${text(e.slug)}, ${text(e.startsAt)}, ${json(e)});`,
  ),
  ...albums.map(
    (a) =>
      `insert into public.albums (dahira_id, slug, date, data) values (${dahiraId}, ${text(a.slug)}, ${text(a.date)}, ${json(a)});`,
  ),
];
writeFileSync('supabase/seed.sql', lines.join('\n') + '\n');
console.log(`seed.sql : 1 dahira, ${events.length} événements, ${albums.length} albums`);
