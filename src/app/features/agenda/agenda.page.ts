import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlbumService } from '../../core/data/album.service';
import { EventService } from '../../core/data/event.service';
import { fmtDate, monthKey } from '../../core/utils/dates';
import { ArchPhoto } from '../../shared/ui/arch-photo/arch-photo';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { Timeline } from '../../shared/ui/timeline/timeline';
import { EventFeature } from './event-feature';
import { NotifyOptin } from '../../shared/ui/notify-optin/notify-optin';
import { Reveal } from '../../shared/motion/reveal.directive';
import { albumCover } from '../../core/models';

const monthChip = (iso: string, withYear: boolean) => {
  const f = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'Africa/Dakar',
  }).format(new Date(iso));
  return f.charAt(0).toUpperCase() + f.slice(1);
};

@Component({
  selector: 'app-agenda-page',
  imports: [RouterLink, DarkHero, EventFeature, Timeline, ArchPhoto, Reveal, NotifyOptin],
  templateUrl: './agenda.page.html',
  styleUrl: './agenda.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AgendaPage {
  private readonly events = inject(EventService);
  private readonly albums = inject(AlbumService);

  protected readonly next = this.events.next;
  /** Mois sélectionné ('AAAA-MM') ; null = tous */
  protected readonly month = signal<string | null>(null);

  private readonly later = computed(() => this.events.upcoming().slice(1));

  protected readonly months = computed(() => {
    const seen = new Map<string, string>();
    for (const e of this.events.upcoming()) {
      const key = monthKey(e.startsAt);
      if (!seen.has(key)) seen.set(key, monthChip(e.startsAt, seen.size === 0));
    }
    return [...seen].map(([key, label]) => ({ key, label }));
  });

  protected readonly filtered = computed(() => {
    const m = this.month();
    return m ? this.later().filter((e) => monthKey(e.startsAt) === m) : this.later();
  });

  protected readonly lastPast = computed(() => {
    // Seulement un événement dont l'album existe vraiment (sinon lien vers une page introuvable)
    const event = this.events.past().find((e) => e.albumSlug && this.albums.bySlug(e.albumSlug));
    if (!event) return undefined;
    const album = this.albums.bySlug(event.albumSlug!);
    return {
      event,
      album,
      cover: album ? albumCover(album) : undefined,
      count: album?.photos?.length ?? album?.count ?? 0,
      date: fmtDate(event.startsAt),
    };
  });

  protected toggle(key: string | null): void {
    this.month.set(this.month() === key ? null : key);
  }
}
