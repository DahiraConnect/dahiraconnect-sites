// Test bout en bout sans base distante ni écriture en production.
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Miniflare } from 'miniflare';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const fixture = async (name) => JSON.parse(await readFile(`src/assets/mock/${name}.json`, 'utf8'));
const [profil, contenu, bureau, events, albums, quiz] = await Promise.all(
  ['tenant', 'content', 'board', 'events', 'albums', 'quiz'].map(fixture),
);
const calls = [];
const database = createServer((req, res) => {
  const url = new URL(req.url, 'http://database.local');
  calls.push(url);
  const slug = url.searchParams.get('adresse')?.replace('eq.', '');
  let rows;
  if (url.pathname.endsWith('/sites'))
    rows = ['moutahabina', 'nouveau-dahira'].includes(slug)
      ? [
          {
            dahira_id: slug,
            profil: {
              ...profil,
              ...(slug === 'nouveau-dahira'
                ? {
                    name: 'Dahira de vérification',
                    shortName: 'Vérification',
                    theme: { 'color-primary': '#123456' },
                  }
                : {}),
            },
            contenu,
            bureau,
            quiz,
          },
        ]
      : [];
  else if (url.pathname.endsWith('/site_evenements'))
    rows = events.map((data) => ({ id: data.id, slug: data.slug, data }));
  else if (url.pathname.endsWith('/site_albums'))
    rows = albums.map((data) => ({ id: data.id, slug: data.slug, data }));
  else {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(rows));
});
await new Promise((resolve) => database.listen(0, '127.0.0.1', resolve));
const dbPort = database.address().port;
const packaged = await mkdtemp(join(tmpdir(), 'dahiraconnect-worker-smoke-'));
await promisify(execFile)(
  process.execPath,
  ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--dry-run', '--outdir', packaged],
  {
    env: { ...process.env, WRANGLER_LOG_PATH: join(tmpdir(), 'dahiraconnect-smoke-wrangler.log') },
  },
);
const workerConfig = {
  compatibilityDate: '2026-11-23',
  compatibilityFlags: ['nodejs_compat'],
  manifest: {
    mainModule: 'server.js',
    modules: {
      'server.js': { type: 'esm', contents: await readFile(`${packaged}/server.js`, 'utf8') },
    },
  },
  assets: { directory: 'dist/dahiraconnect/browser', runWorkerFirst: true, hasUserWorker: true },
  env: {
    ASSETS: { type: 'assets' },
    SUPABASE_URL: { type: 'text', value: `http://127.0.0.1:${dbPort}` },
    SUPABASE_ANON_KEY: { type: 'text', value: 'local-public-key' },
    PREVIEW_HOST: { type: 'text', value: '' },
    PREVIEW_SITE: { type: 'text', value: '' },
  },
};
const previewHost = 'dahiraconnect-preview.diemelamine398.workers.dev';
const worker = new Miniflare({
  telemetry: { enabled: false },
  workers: [
    { config: { ...workerConfig, name: 'dahiraconnect-smoke' } },
    {
      config: {
        ...workerConfig,
        name: 'dahiraconnect-preview-smoke',
        env: {
          ...workerConfig.env,
          PREVIEW_HOST: { type: 'text', value: previewHost },
          PREVIEW_SITE: { type: 'text', value: 'moutahabina' },
        },
      },
    },
  ],
});
const get = (slug, path = '/', init = {}) =>
  worker.dispatchFetch(`https://${slug}.akkili.sn${path}`, init);
const logs = '';
try {
  for (const slug of ['moutahabina', 'nouveau-dahira']) {
    const home = await get(slug);
    const html = await home.text();
    assert.equal(home.status, 200, html.slice(0, 1000) + logs.slice(-4000));
    const name = slug === 'moutahabina' ? profil.name : 'Dahira de vérification';
    assert.ok(html.includes(name), 'Nom dans le HTML serveur');
    assert.match(html, /property="og:title"/);
    assert.ok(html.includes(`${slug}.akkili.sn/`), 'Canonical et Open Graph propres au site');
    assert.match(html, /public-tenant/, 'Données transférées pour l’hydratation');
    for (const path of [
      '/agenda/',
      '/galerie/',
      '/le-dahira/',
      '/le-dahira/notre-guide/',
      '/le-dahira/bureau/',
      '/le-dahira/charte/',
      '/rejoindre/',
      `/agenda/${events[0].slug}/`,
      `/galerie/${albums[0].slug}/`,
      '/manifest.webmanifest',
      '/sitemap.xml',
      '/robots.txt',
      '/agenda.ics',
      '/api/site',
    ]) {
      const response = await get(slug, path);
      assert.equal(response.status, 200, `${slug}${path}\n${logs.slice(-2000)}`);
      await response.arrayBuffer();
    }
    assert.equal((await get(slug, '/adresse-inconnue')).status, 404);
    assert.equal((await get(slug, '/', { method: 'HEAD' })).status, 200);
    console.log(
      `✓ ${slug} : pages publiques, événement, album, SEO, manifeste, calendrier, API et 404`,
    );
  }
  const query = await (await get('nouveau-dahira', '/api/site?tenant=moutahabina')).json();
  assert.equal(query.dahira.slug, 'nouveau-dahira');
  assert.equal((await get('hors-ligne')).status, 404);
  assert.ok(calls.some((url) => url.searchParams.get('adresse') === 'eq.nouveau-dahira'));
  console.log(
    '✓ Isolation des sites et refus des sites hors ligne ; aucune base distante utilisée',
  );
  const preview = await worker.getWorker('dahiraconnect-preview-smoke');
  const previewResponse = await preview.fetch(`https://${previewHost}/api/site?tenant=autre`, {
    headers: { Host: previewHost },
  });
  assert.equal(previewResponse.status, 200);
  const previewPage = await preview.fetch(`https://${previewHost}/`, {
    headers: { Host: previewHost },
  });
  assert.equal(previewPage.status, 200);
  assert.ok((await previewPage.text()).includes(profil.name));
  assert.equal(previewResponse.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal((await previewResponse.json()).dahira.slug, 'moutahabina');
  assert.equal((await preview.fetch('https://autre.compte.workers.dev/')).status, 404);
  assert.equal((await worker.dispatchFetch(`https://${previewHost}/`)).status, 404);
  console.log(
    '✓ Prévisualisation isolée : site imposé, pas d’indexation et aucun accès sur le Worker de production',
  );
  if (process.env.CHROME_BIN) {
    const local = await worker.ready;
    const profile = await mkdtemp(join(tmpdir(), 'dahiraconnect-browser-'));
    const { stdout: dom } = await promisify(execFile)(
      process.env.CHROME_BIN,
      [
        '--headless',
        '--disable-gpu',
        '--no-first-run',
        `--user-data-dir=${profile}`,
        '--virtual-time-budget=5000',
        '--dump-dom',
        `${local}?tenant=nouveau-dahira`,
      ],
      { timeout: 30_000, maxBuffer: 4_000_000 },
    );
    assert.ok(
      dom.includes('Dahira de vérification'),
      'Le navigateur garde le dahira après hydratation',
    );
    assert.match(dom, /<app-root[^>]+ng-version=/);
    assert.doesNotMatch(dom, /<app-root[^>]+ngh=/, 'Hydratation du composant racine terminée');
    console.log('✓ Chrome : rendu du nouveau dahira et hydratation terminée');
  }
} catch (error) {
  console.error(logs.slice(-9000));
  throw error;
} finally {
  await worker.dispose();
  await new Promise((resolve) => database.close(resolve));
}
