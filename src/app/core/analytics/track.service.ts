import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SUPABASE } from '../../../environments/supabase';
import { TenantService } from '../tenant/tenant.service';
import { clickKey, deviceType, viewKey } from './track';

/**
 * Statistiques anonymes du site public : pages vues et boutons importants touchés.
 * Un simple compteur par jour : ni cookie, ni identifiant, ni adresse IP conservée.
 */
@Injectable({ providedIn: 'root' })
export class TrackService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly tenant = inject(TenantService);
  private readonly enabled =
    isPlatformBrowser(inject(PLATFORM_ID)) &&
    !!SUPABASE.url &&
    // Robots, tests automatisés et audits (Lighthouse) : non comptés
    !navigator.webdriver;

  private device: string | null = null;

  start(): void {
    if (!this.enabled) return;
    this.device = deviceType(matchMedia('(pointer: coarse)').matches, Math.min(screen.width, innerWidth));
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const key = viewKey(e.urlAfterRedirects);
        if (key) this.send('view', key);
      });
    this.document.addEventListener(
      'click',
      (event) => {
        const key = event.target instanceof Element ? clickKey(event.target) : null;
        if (key) this.send('click', key);
      },
      { capture: true, passive: true },
    );
  }

  private send(kind: 'view' | 'click', key: string): void {
    // Après l'affichage : ne ralentit jamais la page
    setTimeout(() => {
      fetch(`${SUPABASE.url}/rest/v1/rpc/track`, {
        method: 'POST',
        keepalive: true,
        headers: { apikey: SUPABASE.anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_slug: this.tenant.dahira().slug, p_kind: kind, p_key: key, p_device: this.device }),
      }).catch(() => undefined);
    }, kind === 'view' ? 1500 : 0);
  }
}
