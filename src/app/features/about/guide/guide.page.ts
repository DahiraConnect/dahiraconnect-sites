import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/data/content.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { DarkHero } from '../../../shared/ui/dark-hero/dark-hero';
import { Medallion } from '../../../shared/ui/medallion/medallion';
import { Timeline } from '../../../shared/ui/timeline/timeline';
import { Reveal } from '../../../shared/motion/reveal.directive';

@Component({
  selector: 'app-guide-page',
  imports: [RouterLink, DarkHero, Medallion, Timeline, Reveal],
  templateUrl: './guide.page.html',
  styleUrl: './guide.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GuidePage {
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly content = inject(ContentService).guide;
  protected readonly ringText = computed(
    () => `${this.dahira().guideName.toUpperCase()} • NOTRE GUIDE •`,
  );
  /** Texte entre crochets = à fournir par le bureau : affiché en encadré pointillé */
  protected readonly bioIsPlaceholder = computed(() => this.content().bio.startsWith('['));
}
