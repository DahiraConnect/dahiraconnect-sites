import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection, isDevMode,
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
import { TenantService } from './core/tenant/tenant.service';
import { applyTenantTheme } from './core/tenant/theme.initializer';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Dahira courant (selon le host) puis ses couleurs, avant le premier rendu
    provideAppInitializer(() => {
      const tenant = inject(TenantService);
      const applyTheme = applyTenantTheme();
      const track = inject(TrackService);
      // Puis statistiques anonymes (navigateur uniquement)
      return tenant.load().then(applyTheme).then(() => track.start());
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
    // Application installable + hors ligne (production uniquement)
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
