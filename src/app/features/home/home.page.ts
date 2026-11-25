import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlbumService } from '../../core/data/album.service';
import { ContentService } from '../../core/data/content.service';
import { EventService } from '../../core/data/event.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { AlbumCard } from '../../shared/ui/album-card/album-card';
import { AnnouncementBanner } from '../../shared/ui/announcement/announcement';
import { CopyNumber } from '../../shared/ui/copy-number/copy-number';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { EventTicket } from '../../shared/ui/event-ticket/event-ticket';
import { Medallion } from '../../shared/ui/medallion/medallion';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { WaButton } from '../../shared/ui/wa-button/wa-button';
import { groupPayments } from '../../core/utils/payments';
import { QuizService } from '../../core/data/quiz.service';
import { plural } from '../../core/utils/plural';
import { Reveal } from '../../shared/motion/reveal.directive';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    NgOptimizedImage,
    DarkHero,
    Medallion,
    WaButton,
    SectionHeading,
    EventTicket,
    AlbumCard,
    CopyNumber,
    Reveal,
    AnnouncementBanner,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly content = inject(ContentService).home;
  protected readonly nextEvent = inject(EventService).next;
  private readonly albums = inject(AlbumService);
  protected readonly moments = computed(() => this.albums.all().slice(0, 3));
  /** Un seul numéro à copier quand Wave et Orange Money partagent le même */
  protected readonly payments = computed(() => groupPayments(this.dahira().support));
  protected readonly quizThemes = inject(QuizService).topThemes;
  protected readonly plural = plural;
}
