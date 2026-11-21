import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TenantService } from '../tenant/tenant.service';

export interface SeoData {
  description?: string;
  /** Chemin ou URL absolue de l'image d'aperçu */
  image?: string;
}

/** Métadonnées Open Graph : aperçu soigné quand le lien est partagé sur WhatsApp. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly tenant = inject(TenantService);

  update(title: string, { description, image }: SeoData = {}): void {
    const dahira = this.tenant.dahira();
    const desc = description ?? `${dahira.name} — ${dahira.motto}`;
    const img = this.tenant.absoluteUrl(image ?? dahira.logoUrl);

    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: dahira.name });
    this.meta.updateTag({ property: 'og:locale', content: 'fr_FR' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: img });
    this.meta.updateTag({ property: 'og:url', content: this.tenant.absoluteUrl() });
  }

}
