import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BoardService } from '../../core/data/board.service';
import { ContentService } from '../../core/data/content.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { Medallion } from '../../shared/ui/medallion/medallion';
import { MemberCard } from '../../shared/ui/member-card/member-card';
import { Timeline } from '../../shared/ui/timeline/timeline';
import { Reveal } from '../../shared/motion/reveal.directive';

const TONES = ['green', 'mid', 'blue', 'gold'] as const;

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, DarkHero, Timeline, Medallion, MemberCard, Reveal],
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AboutPage {
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly content = inject(ContentService).about;
  protected readonly members = inject(BoardService).members;
  protected readonly tone = (i: number) => TONES[i % TONES.length];
  /** 'Dahira Moutahabina Fillahi' → 'Moutahabina Fillahi' */
  protected readonly shortTitle = () => this.dahira().name.replace(/^Dahira\s+/i, '');
}
