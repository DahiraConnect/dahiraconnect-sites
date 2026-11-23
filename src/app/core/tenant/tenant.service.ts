import { isPlatformServer } from '@angular/common';
import {
  DOCUMENT,
  Injectable,
  PLATFORM_ID,
  REQUEST,
  REQUEST_CONTEXT,
  TransferState,
  makeStateKey,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MOCK_SOURCES, TenantBundle } from '../data/tenant-bundle';
import { LIVE_SITE_RUNTIME } from './tenant-runtime';
import { DEFAULT_TENANT, isLocalHost, resolveTenantSlug } from './tenant.config';

/**
 * Dahira courant, déduit du host. Chargé une fois par l'initialiseur d'application :
 * après le démarrage, `dahira()` et `bundle()` ne sont jamais nuls.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly context = inject(REQUEST_CONTEXT, { optional: true }) as {
    tenantBundle?: TenantBundle;
  } | null;
  private readonly transfer = inject(TransferState);
  private readonly liveRuntime = inject(LIVE_SITE_RUNTIME);
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
      this.isServer && siteUrl && !this.request
        ? new URL(current.pathname + current.search, siteUrl)
        : current;
    return new URL(path, base).toString();
  }

  async load(): Promise<void> {
    const key = makeStateKey<TenantBundle>('public-tenant');
    let bundle = this.context?.tenantBundle ?? this.transfer.get(key, null);
    // La découverte des routes au build ne correspond à aucune requête publique.
    if (!bundle && (!this.liveRuntime || (this.isServer && !this.request))) {
      const slug = resolveTenantSlug(this.currentUrl()) ?? DEFAULT_TENANT;
      bundle = await (MOCK_SOURCES[slug] ?? MOCK_SOURCES[DEFAULT_TENANT])();
    }
    if (!bundle) {
      const url = this.currentUrl();
      const slug = resolveTenantSlug(url);
      if (!slug) throw new Error('Site introuvable');
      const api = new URL('/api/site', url);
      if (isLocalHost(url.hostname)) api.searchParams.set('tenant', slug);
      const response = await fetch(api);
      if (!response.ok) throw new Error('Site indisponible');
      bundle = (await response.json()) as TenantBundle;
    }
    this._bundle.set(bundle);
    if (this.isServer) this.transfer.set(key, bundle);
    else this.transfer.remove(key);
  }

  private currentUrl(): URL {
    return new URL(this.request?.url ?? this.document.location.href);
  }
}
