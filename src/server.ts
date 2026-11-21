import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { MOCK_SOURCES } from './app/core/data/tenant-bundle';
import { buildManifest } from './app/core/tenant/manifest';
import { DEFAULT_TENANT, resolveTenantSlug } from './app/core/tenant/tenant.config';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Manifeste PWA du dahira courant (nom, couleurs, icônes selon le sous-domaine).
 * Déclaré avant les fichiers statiques pour remplacer le manifeste par défaut.
 */
app.get('/manifest.webmanifest', async (req, res, next) => {
  try {
    const url = new URL(req.originalUrl, `${req.protocol}://${req.get('host')}`);
    const slug = resolveTenantSlug(url);
    const { dahira } = await (MOCK_SOURCES[slug] ?? MOCK_SOURCES[DEFAULT_TENANT])();
    res
      .type('application/manifest+json')
      .set('Cache-Control', 'public, max-age=3600')
      .send(JSON.stringify(buildManifest(dahira)));
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
