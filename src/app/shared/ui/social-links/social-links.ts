import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SocialPlatform } from '../../../core/models';
import { TenantService } from '../../../core/tenant/tenant.service';

const PLATFORMS: Record<SocialPlatform, { label: string; icon: string }> = {
  tiktok: { label: 'TikTok', icon: 'ph-tiktok-logo' },
  facebook: { label: 'Facebook', icon: 'ph-facebook-logo' },
  instagram: { label: 'Instagram', icon: 'ph-instagram-logo' },
  youtube: { label: 'YouTube', icon: 'ph-youtube-logo' },
  whatsapp: { label: 'Chaîne WhatsApp', icon: 'ph-whatsapp-logo' },
  x: { label: 'X', icon: 'ph-x-logo' },
};

/** Liens vers les réseaux sociaux du dahira : pastilles (footer) ou liste (Rejoindre). */
@Component({
  selector: 'app-social-links',
  templateUrl: './social-links.html',
  styleUrl: './social-links.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"social social--" + variant() + " social--on-" + tone()' },
})
export class SocialLinks {
  readonly variant = input<'icons' | 'list'>('icons');
  readonly tone = input<'dark' | 'light'>('dark');

  private readonly tenant = inject(TenantService);
  protected readonly links = computed(() =>
    (this.tenant.dahira().social ?? []).map((link) => ({ ...link, ...PLATFORMS[link.platform] })),
  );
}
