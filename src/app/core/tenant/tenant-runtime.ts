import { InjectionToken } from '@angular/core';

/** Activé uniquement dans le profil Worker ; Pages conserve son pilote pré-généré. */
export const LIVE_SITE_RUNTIME = new InjectionToken<boolean>('LIVE_SITE_RUNTIME', {
  providedIn: 'root',
  factory: () => false,
});
