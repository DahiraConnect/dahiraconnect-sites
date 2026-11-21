import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TenantService } from '../tenant/tenant.service';
import { SeoData, SeoService } from './seo.service';

/**
 * Titre de page : "<titre> · <nom du dahira>", plus les balises Open Graph.
 * La description vient de `data.seo` (statique) ou de `resolve.seo` (pages de détail).
 */
@Injectable({ providedIn: 'root' })
export class DahiraTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly tenant = inject(TenantService);
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const name = this.tenant.dahira().name;
    const page = this.buildTitle(snapshot);
    const full = page && page !== 'Accueil' ? `${page} · ${name}` : name;
    this.title.setTitle(full);
    this.seo.update(full, deepest(snapshot.root).data['seo'] as SeoData | undefined);
  }
}

function deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? deepest(route.firstChild) : route;
}
