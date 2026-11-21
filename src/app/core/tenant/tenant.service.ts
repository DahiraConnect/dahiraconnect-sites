import { DOCUMENT, Injectable, REQUEST, computed, inject, signal } from '@angular/core';
import { MOCK_SOURCES, TenantBundle } from '../data/tenant-bundle';
import { DEFAULT_TENANT, resolveTenantSlug } from './tenant.config';

/**
 * Dahira courant, déduit du host. Chargé une fois par l'initialiseur d'application :
 * après le démarrage, `dahira()` et `bundle()` ne sont jamais nuls.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly _bundle = signal<TenantBundle | null>(null);

  readonly bundle = computed(() => {
    const bundle = this._bundle();
    if (!bundle) throw new Error('TenantService : dahira non chargé');
    return bundle;
  });
  readonly dahira = computed(() => this.bundle().dahira);

  /** URL absolue de la page courante (partage, Open Graph). */
  absoluteUrl(path = ''): string {
    return new URL(path, this.currentUrl()).toString();
  }

  async load(): Promise<void> {
    const slug = resolveTenantSlug(this.currentUrl());
    const loader = MOCK_SOURCES[slug] ?? MOCK_SOURCES[DEFAULT_TENANT];
    this._bundle.set(await loader());
  }

  private currentUrl(): URL {
    return new URL(this.request?.url ?? this.document.location.href);
  }
}
