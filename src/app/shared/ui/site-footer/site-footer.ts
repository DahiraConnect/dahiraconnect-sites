import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';
import { buildTelLink } from '../../../core/utils/whatsapp';
import { SocialLinks } from '../social-links/social-links';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, SocialLinks],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly tel = computed(() => buildTelLink(this.dahira().contact.phone));
  /** Premier mot du nom arabe, en filigrane */
  protected readonly watermark = computed(() => this.dahira().nameArabic?.split(' ')[0] ?? '');
  protected readonly year = new Date().getFullYear();
}
