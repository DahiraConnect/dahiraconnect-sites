// Après `ng build` : prépare le dossier pour Cloudflare Pages.
// - 404.html à la racine : Cloudflare le sert (avec le statut 404) pour toute adresse inconnue.
import { copyFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const out = 'dist/dahiraconnect/browser';
const src = join(out, '404', 'index.html');

try {
  await access(src);
  await copyFile(src, join(out, '404.html'));
  console.log('postbuild : 404.html prêt');
} catch {
  console.error('postbuild : page 404 introuvable dans', src);
  process.exit(1);
}
