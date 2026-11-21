import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/data/content.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { buildTelLink } from '../../core/utils/whatsapp';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { Medallion } from '../../shared/ui/medallion/medallion';
import { WaButton } from '../../shared/ui/wa-button/wa-button';
import { SocialLinks } from '../../shared/ui/social-links/social-links';
import { Reveal } from '../../shared/motion/reveal.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-join-page',
  imports: [RouterLink, DarkHero, Medallion, WaButton, SocialLinks, Reveal],
  templateUrl: './join.page.html',
  styleUrl: './join.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class JoinPage {
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly content = inject(ContentService).join;
  protected readonly ringText = computed(() => `BIENVENUE • ${this.dahira().ringText}`);
  protected readonly tel = computed(() => {
    const n = this.dahira().join.callNumber;
    return n ? buildTelLink(n) : '';
  });
}
