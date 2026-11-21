import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DahiraEvent } from '../../core/models';
import { TenantService } from '../../core/tenant/tenant.service';
import {
  daysUntil,
  fmtCountdown,
  fmtDay,
  fmtDayMonth,
  fmtEventTime,
  fmtMonthShort,
  fmtTime,
  fmtWeekday,
} from '../../core/utils/dates';
import { buildIcsDataUrl, buildMapLink } from '../../core/utils/ics';
import { buildWaShare } from '../../core/utils/whatsapp';
import { Lightbox } from '../../shared/ui/lightbox/lightbox';

/** « Ziar à Tivaouane — dimanche 20 décembre, Tivaouane » (+ « à 20 h 30 » si l'heure est connue) */
const shareText = (e: DahiraEvent) => {
  const day = `${fmtWeekday(e.startsAt).toLowerCase()} ${fmtDayMonth(e.startsAt)}`;
  const time = e.timeTbc ? '' : ` à ${fmtTime(e.startsAt)}`;
  return `${e.title} — ${day}${time}, ${e.place}`;
};

/** Carte flottante d'un événement : date, compte à rebours, itinéraire, partage, rappel. */
@Component({
  selector: 'app-event-feature',
  imports: [NgOptimizedImage, Lightbox],
  templateUrl: './event-feature.html',
  styleUrl: './event-feature.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventFeature {
  private readonly tenant = inject(TenantService);

  readonly event = input.required<DahiraEvent>();
  /** Niveau du titre : h2 dans l'agenda, h1 sur la fiche */
  readonly headingLevel = input<1 | 2>(2);
  /** Miniatures des images (inutile sur la fiche, qui les montre en grand) */
  readonly showMedia = input(true);

  protected readonly day = computed(() => fmtDay(this.event().startsAt));
  protected readonly dateLine = computed(
    () => `${fmtMonthShort(this.event().startsAt)} · ${fmtWeekday(this.event().startsAt).toUpperCase()}`,
  );
  protected readonly countdown = computed(() => fmtCountdown(daysUntil(this.event().startsAt)));
  protected readonly time = computed(() => fmtEventTime(this.event()));
  protected readonly pageUrl = computed(() => this.tenant.absoluteUrl(`/agenda/${this.event().slug}`));
  protected readonly mapUrl = computed(() => buildMapLink(this.event()));
  protected readonly shareUrl = computed(() =>
    buildWaShare(
      shareText(this.event()),
      this.pageUrl(),
    ),
  );
  protected readonly icsUrl = computed(() =>
    buildIcsDataUrl(this.event(), this.tenant.dahira().name, this.pageUrl()),
  );
  protected readonly icsName = computed(() => `${this.event().slug}.ics`);
  protected readonly images = computed(() => this.event().images ?? []);
  /** Photo ouverte dans la visionneuse (null = fermée) */
  protected readonly viewing = signal<number | null>(null);
  protected readonly mediaLabel = computed(() => {
    const n = this.images().length;
    return n > 1 ? `Voir les ${n} images` : "Voir l'affiche";
  });
}
