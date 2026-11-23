import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: ['src/worker/public-site.ts'],
  bundle: true,
  write: false,
  platform: 'neutral',
  format: 'esm',
});
const { loadPublicSite, createSiteHandler, SiteUnavailable, requestForPreview } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`
);
const fixture = async (name) => JSON.parse(await readFile(`src/assets/mock/${name}.json`, 'utf8'));
const pilot = {
  dahira: await fixture('tenant'),
  content: await fixture('content'),
  board: await fixture('board'),
  events: await fixture('events'),
  albums: await fixture('albums'),
  quiz: await fixture('quiz'),
};
const bundle = (slug) => ({
  ...pilot,
  dahira: { ...pilot.dahira, slug, name: `Dahira ${slug}`, siteUrl: `https://${slug}.akkili.sn` },
});
const handler = (overrides = {}) =>
  createSiteHandler({
    load: async (slug) => {
      if (slug === 'absent' || slug === 'hors-ligne') throw new SiteUnavailable(404);
      return bundle(slug);
    },
    render: async (request, site) =>
      new Response(`<h1>${site.dahira.name}</h1>`, { headers: { 'Content-Type': 'text/html' } }),
    assets: async () => new Response('asset'),
    calendar: (site) => `CALENDAR:${site.dahira.slug}`,
    ...overrides,
  });
const request = (host, path = '/', init) => new Request(`https://${host}${path}`, init);

test('deux sous-domaines rendent chacun leur dahira, sans effet du paramètre tenant public', async () => {
  const serve = handler();
  const [a, b] = await Promise.all([
    serve(request('premier.akkili.sn', '/?tenant=second')),
    serve(request('second.akkili.sn')),
  ]);
  assert.match(await a.text(), /Dahira premier/);
  assert.match(await b.text(), /Dahira second/);
  assert.equal(a.headers.get('Cache-Control'), 'no-store');
});

test('site absent et hors ligne : 404 sans contenu du pilote', async () => {
  for (const host of [
    'absent.akkili.sn',
    'hors-ligne.akkili.sn',
    'inconnu.example',
    'a.b.akkili.sn',
    'www.akkili.sn',
  ]) {
    const response = await handler()(request(host));
    assert.equal(response.status, 404, host);
    assert.doesNotMatch(await response.text(), /moutahabina/i);
  }
});

test('pas de repli vers une démo quand Supabase échoue', async () => {
  const response = await handler({
    load: async () => {
      throw new Error('network');
    },
  })(request('premier.akkili.sn'));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('manifeste, sitemap, robots, calendrier et API suivent le sous-domaine', async () => {
  const serve = handler();
  for (const path of [
    '/manifest.webmanifest',
    '/sitemap.xml',
    '/robots.txt',
    '/agenda.ics',
    '/api/site',
  ]) {
    const response = await serve(request('second.akkili.sn', path));
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /second/, path);
  }
  const manifest = await (await serve(request('second.akkili.sn', '/manifest.webmanifest'))).json();
  assert.equal(manifest.icons[0].src, pilot.dahira.logoUrl);
});

test('les fichiers HTML et JSON statiques ne contournent pas le chargement du site', async () => {
  for (const path of ['/index.html', '/index.csr.html', '/assets/mock/tenant.json', '/ngsw.json']) {
    assert.equal((await handler()(request('premier.akkili.sn', path))).status, 404, path);
  }
  assert.equal(
    await (await handler()(request('premier.akkili.sn', '/assets/fonts/font.woff2'))).text(),
    'asset',
  );
});

test('HEAD conserve le statut et les en-têtes sans corps ; POST est refusé', async () => {
  const response = await handler()(request('premier.akkili.sn', '/', { method: 'HEAD' }));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
  assert.equal(
    (await handler()(request('premier.akkili.sn', '/', { method: 'POST' }))).status,
    405,
  );
});

test('le chargeur ne lit que les tables publiques avec la clé publique, sans jeton utilisateur', async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    const table = url.pathname.split('/').pop();
    return Response.json(
      table === 'sites'
        ? [
            {
              dahira_id: 'site-id',
              profil: pilot.dahira,
              contenu: pilot.content,
              bureau: pilot.board,
            },
          ]
        : table === 'site_evenements'
          ? [{ id: 'event-id', slug: 'nouveau', data: { title: 'Nouveau' } }]
          : [],
    );
  };
  const site = await loadPublicSite('nouveau', 'https://database.example', 'public-key', fetcher);
  assert.equal(site.dahira.slug, 'nouveau');
  assert.equal(site.dahira.siteUrl, 'https://nouveau.akkili.sn');
  assert.equal(site.events[0].id, 'event-id');
  assert.equal(site.quiz, undefined);
  assert.deepEqual(calls.map((c) => c.url.pathname.split('/').pop()).sort(), [
    'site_albums',
    'site_evenements',
    'sites',
  ]);
  assert.equal(calls[0].url.searchParams.get('en_ligne'), 'eq.true');
  assert.equal(calls[0].url.searchParams.get('adresse'), 'eq.nouveau');
  for (const call of calls) assert.deepEqual(call.init.headers, { apikey: 'public-key' });
});

test('un site invisible en RLS ne déclenche aucune lecture de ses événements', async () => {
  let count = 0;
  await assert.rejects(
    loadPublicSite('absent', 'https://database.example', 'public', async () => {
      count++;
      return Response.json([]);
    }),
    (error) => error.status === 404,
  );
  assert.equal(count, 1);
});

test('une erreur de lecture des événements échoue sans servir de contenu partiel', async () => {
  await assert.rejects(
    loadPublicSite('premier', 'https://database.example', 'public', async (url) =>
      url.pathname.endsWith('/sites')
        ? Response.json([{ dahira_id: 'id', profil: pilot.dahira }])
        : new Response(null, { status: 403 }),
    ),
    (error) => error.status === 503,
  );
});

test('la prévisualisation ne réécrit que son hôte configuré et garde le site imposé', () => {
  const host = 'preview.compte.workers.dev';
  const original = new Request(`https://${host}/agenda/?tenant=autre`, {
    headers: {
      Host: host,
      'X-Forwarded-Host': 'autre.example',
      Forwarded: 'host=autre.example',
    },
  });
  const mapped = requestForPreview(original, host, 'moutahabina');
  assert.equal(new URL(mapped.url).hostname, 'moutahabina.akkili.sn');
  assert.equal(new URL(mapped.url).pathname, '/agenda/');
  assert.equal(mapped.headers.get('Host'), 'moutahabina.akkili.sn');
  assert.equal(mapped.headers.get('X-Forwarded-Host'), null);
  assert.equal(mapped.headers.get('Forwarded'), null);
  assert.equal(original.headers.get('Host'), host);
  assert.equal(new URL(original.url).hostname, host);
  for (const input of [
    new Request('https://autre.compte.workers.dev/'),
    new Request('https://moutahabina.akkili.sn/'),
  ]) {
    assert.equal(requestForPreview(input, host, 'moutahabina'), input);
  }
});

test('le mode de prévisualisation est inactif en production et refuse une adresse invalide', () => {
  const original = new Request('https://preview.compte.workers.dev/');
  assert.equal(requestForPreview(original, '', ''), original);
  assert.equal(requestForPreview(original, 'preview.compte.workers.dev', '../autre'), original);
  const publicSite = new Request('https://moutahabina.akkili.sn/');
  assert.equal(requestForPreview(publicSite, 'moutahabina.akkili.sn', 'autre'), publicSite);
});
