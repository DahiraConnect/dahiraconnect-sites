// Les anciens artefacts Pages sont incompatibles avec le routage multi-dahira.
import { rm } from 'node:fs/promises';
const out = 'dist/dahiraconnect/browser';
for (const file of [
  '_redirects',
  'manifest.webmanifest',
  'sitemap.xml',
  'robots.txt',
  'agenda.ics',
]) {
  await rm(`${out}/${file}`, { force: true });
}
console.log('postbuild : les documents propres au dahira seront servis par le Worker.');
