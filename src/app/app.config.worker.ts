import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { DahiraTitleStrategy } from './core/seo/title.strategy';
import { TrackService } from './core/analytics/track.service';
import { LIVE_SITE_RUNTIME } from './core/tenant/tenant-runtime';
import { TenantService } from './core/tenant/tenant.service';
import { applyTenantTheme } from './core/tenant/theme.initializer';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LIVE_SITE_RUNTIME, useValue: true },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Dahira courant (selon le host) puis ses couleurs, avant le premier rendu
    provideAppInitializer(() => {
      const tenant = inject(TenantService);
      const applyTheme = applyTenantTheme();
      const track = inject(TrackService);
      // Puis statistiques anonymes (navigateur uniquement)
      return tenant
        .load()
        .then(applyTheme)
        .then(() => track.start());
    }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Fondu enchaîné entre les pages (navigateurs compatibles ; sinon navigation normale)
      withViewTransitions({ skipInitialTransition: true }),
    ),
    { provide: TitleStrategy, useClass: DahiraTitleStrategy },
    provideClientHydration(withEventReplay()),
    // Le manifeste reste installable ; le cache statique sera réintroduit avec une stratégie multi-site.
    provideServiceWorker('ngsw-worker.js', {
      enabled: false,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
