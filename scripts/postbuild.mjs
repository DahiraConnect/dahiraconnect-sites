// Après `ng build` : prépare le dossier pour Cloudflare Pages.
// 1. 404.html à la racine : Cloudflare le sert (avec le statut 404) pour toute adresse inconnue.
// 2. Adresses absolues des fichiers du build (/chunk-…js au lieu de chunk-…js) :
//    Cloudflare recopie les <link rel="modulepreload"> en en-têtes « Early Hints », où <base href>
//    ne s'applique pas ; des adresses relatives y donnaient des 404 sur les pages profondes.
import { execFileSync } from 'node:child_process';
import { access, copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildIcs } from './agenda-ics.mjs';

const out = 'dist/dahiraconnect/browser';
const ASSET = /(href|src)="((?:chunk|main|polyfills|styles)-[A-Z0-9]+\.(?:js|css))"/g;

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

let pages = 0;
for await (const file of htmlFiles(out)) {
  const html = await readFile(file, 'utf8');
  const fixed = html.replace(ASSET, '$1="/$2"');
  if (fixed !== html) {
    await writeFile(file, fixed);
    pages++;
  }
}
console.log(`postbuild : adresses absolues dans ${pages} pages`);

// 3. sitemap.xml + robots.txt à partir des pages pré-générées et de l'adresse publique du dahira
const tenant = JSON.parse(await readFile('src/assets/mock/tenant.json', 'utf8'));
const site = (tenant.siteUrl ?? '').replace(/\/$/, '');
const { routes } = JSON.parse(await readFile('dist/dahiraconnect/prerendered-routes.json', 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const urls = Object.keys(routes)
  .filter((r) => !/^\/(404|admin)/.test(r))
  .sort()
  .map((r) => `  <url><loc>${site}${r === '/' ? '/' : `${r}/`}</loc><lastmod>${today}</lastmod></url>`);
await writeFile(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
);
await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`postbuild : sitemap.xml (${urls.length} pages) et robots.txt`);

// 3 bis. Calendrier en ligne (abonnement « S'abonner à l'agenda »)
const events = JSON.parse(await readFile('src/assets/mock/events.json', 'utf8'));
await writeFile(join(out, 'agenda.ics'), buildIcs(tenant, events, site));
console.log(`postbuild : agenda.ics (${events.length} événements)`);

// 4. Manifeste du service worker régénéré (les pages ont changé : nouvelles empreintes).
//    Les morceaux propres au back-office (client Supabase…) ne sont pas préchargés chez
//    chaque visiteur : ils passent dans un groupe « à la demande », placé en premier
//    (un fichier appartient au premier groupe qui le cite).
const swConfig = JSON.parse(await readFile('ngsw-config.json', 'utf8'));
const adminChunks = [];
for (const name of await readdir(out)) {
  if (/^chunk-[A-Z0-9]+\.js$/.test(name) && /supabase|app-admin-|Chart\.js|chartjs/.test(await readFile(join(out, name), 'utf8')))
    adminChunks.push(`/${name}`);
}
swConfig.assetGroups.unshift({
  name: 'admin',
  installMode: 'lazy',
  updateMode: 'lazy',
  resources: { files: adminChunks },
});
const swConfigPath = 'dist/ngsw-config.build.json'; // hors du dossier publié
await writeFile(swConfigPath, JSON.stringify(swConfig));
execFileSync('node_modules/.bin/ngsw-config', [out, swConfigPath, '/'], { stdio: 'inherit' });
console.log(`postbuild : manifeste du service worker régénéré (${adminChunks.length} fichiers admin à la demande)`);

const src = join(out, '404', 'index.html');
try {
  await access(src);
  await copyFile(src, join(out, '404.html'));
  console.log('postbuild : 404.html prêt');
} catch {
  console.error('postbuild : page 404 introuvable dans', src);
  process.exit(1);
}
