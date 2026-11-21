import { isPlatformServer } from '@angular/common';
import { DOCUMENT, Injectable, PLATFORM_ID, REQUEST, computed, inject, signal } from '@angular/core';
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
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly _bundle = signal<TenantBundle | null>(null);

  readonly bundle = computed(() => {
    const bundle = this._bundle();
    if (!bundle) throw new Error('TenantService : dahira non chargé');
    return bundle;
  });
  readonly dahira = computed(() => this.bundle().dahira);

  /**
   * URL absolue (partage, Open Graph).
   * Au build (pages pré-générées), l'adresse courante est « localhost » :
   * on utilise alors l'adresse publique du dahira (`siteUrl`).
   */
  absoluteUrl(path = ''): string {
    const siteUrl = this._bundle()?.dahira.siteUrl;
    const current = this.currentUrl();
    const base =
      this.isServer && siteUrl && !this.request ? new URL(current.pathname + current.search, siteUrl) : current;
    return new URL(path, base).toString();
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
