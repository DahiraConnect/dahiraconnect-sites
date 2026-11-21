import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/data/content.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { buildTelLink } from '../../../core/utils/whatsapp';
import { SocialLinks } from '../social-links/social-links';
import { WaButton } from '../wa-button/wa-button';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, NgOptimizedImage, SocialLinks, WaButton],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  private readonly document = inject(DOCUMENT);
  private readonly charter = inject(ContentService).charter;

  protected readonly dahira = inject(TenantService).dahira;
  protected readonly tel = computed(() => buildTelLink(this.dahira().contact.phone));
  /** Premier mot du nom arabe, en filigrane */
  protected readonly watermark = computed(() => this.dahira().nameArabic?.split(' ')[0] ?? '');
  protected readonly year = new Date().getFullYear();

  protected readonly links = computed(() => [
    { path: '/le-dahira', label: 'Qui sommes-nous' },
    { path: '/le-dahira/notre-guide', label: 'Notre guide' },
    { path: '/le-dahira/bureau', label: 'Le bureau' },
    ...(this.charter() ? [{ path: '/le-dahira/charte', label: 'Notre charte' }] : []),
    { path: '/agenda', label: 'Agenda' },
    { path: '/galerie', label: 'Galerie' },
  ]);

  protected toTop(): void {
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    this.document.getElementById('contenu')?.focus({ preventScroll: true });
  }
}
