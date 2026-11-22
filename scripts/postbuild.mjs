// Après `ng build` : prépare le dossier pour Cloudflare Pages.
// 1. 404.html à la racine : Cloudflare le sert (avec le statut 404) pour toute adresse inconnue.
// 2. Adresses absolues des fichiers du build (/chunk-…js au lieu de chunk-…js) :
//    Cloudflare recopie les <link rel="modulepreload"> en en-têtes « Early Hints », où <base href>
//    ne s'applique pas ; des adresses relatives y donnaient des 404 sur les pages profondes.
import { execFileSync } from 'node:child_process';
import { access, copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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

// Les pages ont changé : on régénère le manifeste du service worker (empreintes des fichiers),
// sinon le mode hors ligne refuserait les fichiers modifiés.
execFileSync('node_modules/.bin/ngsw-config', [out, 'ngsw-config.json', '/'], { stdio: 'inherit' });
console.log('postbuild : manifeste du service worker régénéré');

const src = join(out, '404', 'index.html');
try {
  await access(src);
  await copyFile(src, join(out, '404.html'));
  console.log('postbuild : 404.html prêt');
} catch {
  console.error('postbuild : page 404 introuvable dans', src);
  process.exit(1);
}
