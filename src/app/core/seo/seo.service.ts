import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TenantService } from '../tenant/tenant.service';

export interface SeoData {
  description?: string;
  /** Chemin ou URL absolue de l'image d'aperçu */
  image?: string;
  /** Données structurées schema.org (Organization, Event…) */
  jsonLd?: object;
}

/**
 * Métadonnées : description, Open Graph (aperçu WhatsApp), lien canonique, JSON-LD.
 * Appelé par DahiraTitleStrategy à chaque page ; écrit aussi dans les pages pré-générées.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly tenant = inject(TenantService);

  update(title: string, { description, image, jsonLd }: SeoData = {}): void {
    const dahira = this.tenant.dahira();
    const desc = description ?? `${dahira.name} — ${dahira.motto}`;
    const img = this.tenant.absoluteUrl(image ?? dahira.logoUrl);
    const url = this.canonicalUrl();

    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: dahira.name });
    this.meta.updateTag({ property: 'og:locale', content: 'fr_FR' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: img });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    this.setLink('canonical', url);
    this.setJsonLd(jsonLd);
  }

  /** Adresse canonique, telle que servie par l'hébergeur (avec « / » final, sauf l'accueil) */
  private canonicalUrl(): string {
    const url = new URL(this.tenant.absoluteUrl());
    const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/?$/, '/');
    return `${url.origin}${path}`;
  }

  private setLink(rel: string, href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = this.document.createElement('link');
      link.rel = rel;
      this.document.head.appendChild(link);
    }
    link.href = href;
  }

  private setJsonLd(data?: object): void {
    const id = 'ld-json';
    this.document.getElementById(id)?.remove();
    if (!data) return;
    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    // « < » échappé : le JSON ne peut pas fermer la balise <script>
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }
}
