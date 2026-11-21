import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/data/event.service';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { EventFeature } from './event-feature';
import { Lightbox } from '../../shared/ui/lightbox/lightbox';
import { Reveal } from '../../shared/motion/reveal.directive';

/** Fiche d'un événement (/agenda/:slug). Slug inconnu : redirigé par le résolveur de titre. */
@Component({
  selector: 'app-event-page',
  imports: [RouterLink, NgOptimizedImage, DarkHero, EventFeature, Lightbox, Reveal],
  templateUrl: './event.page.html',
  styleUrl: './event.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventPage {
  private readonly events = inject(EventService);

  readonly slug = input.required<string>();

  protected readonly event = computed(() => this.events.bySlug(this.slug()));
  protected readonly images = computed(() => this.event()?.images ?? []);
  protected readonly viewing = signal<number | null>(null);
  protected readonly isPast = computed(() => {
    const e = this.event();
    return !!e && this.events.isPast(e);
  });
}
