import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/data/content.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { buildWaShare } from '../../../core/utils/whatsapp';
import { Reveal } from '../../../shared/motion/reveal.directive';
import { DarkHero } from '../../../shared/ui/dark-hero/dark-hero';

/** Charte du dahira : engagements des membres et déroulement d'une soirée. */
@Component({
  selector: 'app-charter-page',
  imports: [RouterLink, DarkHero, Reveal],
  templateUrl: './charter.page.html',
  styleUrl: './charter.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CharterPage {
  private readonly tenant = inject(TenantService);
  protected readonly charter = inject(ContentService).charter;
  protected readonly shareUrl = computed(() =>
    buildWaShare(
      `La charte du ${this.tenant.dahira().name}`,
      this.tenant.absoluteUrl('/le-dahira/charte'),
    ),
  );
}
