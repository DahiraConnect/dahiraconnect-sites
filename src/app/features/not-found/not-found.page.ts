import { ChangeDetectionStrategy, Component, RESPONSE_INIT, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/data/event.service';
import { fmtDayMonth } from '../../core/utils/dates';
import { Reveal } from '../../shared/motion/reveal.directive';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';

/** Adresse inconnue (ex. lien mal copié dans WhatsApp) : on explique et on propose des chemins. */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, DarkHero, Reveal],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFoundPage {
  private readonly next = inject(EventService).next;

  /** Raccourcis : le prochain rendez-vous en premier, s'il y en a un */
  protected readonly shortcuts = computed(() => {
    const event = this.next();
    return [
      event
        ? {
            path: ['/agenda', event.slug],
            icon: 'ph-calendar-check',
            title: 'Prochain rendez-vous',
            text: `${event.title} — ${fmtDayMonth(event.startsAt)}`,
          }
        : { path: ['/agenda'], icon: 'ph-calendar-blank', title: 'Agenda', text: 'Les rendez-vous du dahira' },
      { path: ['/galerie'], icon: 'ph-images', title: 'Galerie', text: 'Photos et vidéos de nos moments' },
      { path: ['/le-dahira'], icon: 'ph-users-three', title: 'Le dahira', text: 'Notre histoire, notre guide, le bureau' },
      { path: ['/rejoindre'], icon: 'ph-whatsapp-logo', title: 'Nous rejoindre', text: 'Un message sur WhatsApp suffit' },
    ];
  });

  constructor() {
    // Rendu serveur : vrai code 404 (moteurs de recherche, aperçus de liens)
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
  }
}
