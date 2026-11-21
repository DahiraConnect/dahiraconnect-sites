import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album, albumCover, albumPhotoCount } from '../../../core/models';
import { TenantService } from '../../../core/tenant/tenant.service';
import { fmtDayMonth } from '../../../core/utils/dates';
import { buildWaShare } from '../../../core/utils/whatsapp';
import { ArchPhoto } from '../arch-photo/arch-photo';

/** Carte d'album : grande (en-tête de galerie), moyenne (carrousel) ou petite (grille). */
@Component({
  selector: 'app-album-card',
  imports: [RouterLink, ArchPhoto],
  templateUrl: './album-card.html',
  styleUrl: './album-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"album-card album-card--" + size()' },
})
export class AlbumCard {
  private readonly tenant = inject(TenantService);

  readonly album = input.required<Album>();
  readonly size = input<'lg' | 'md' | 'sm'>('sm');

  protected readonly cover = computed(() => albumCover(this.album()));
  protected readonly badge = computed(() => {
    const a = this.album();
    if (a.kind === 'video') return a.durationMin ? `Vidéo · ${a.durationMin} min` : 'Vidéo';
    const n = albumPhotoCount(a);
    return n ? `${n} photo${n > 1 ? 's' : ''}` : '';
  });
  protected readonly meta = computed(() => {
    const a = this.album();
    return [fmtDayMonth(a.date), a.place].filter(Boolean).join(' · ');
  });
  protected readonly shareUrl = computed(() =>
    buildWaShare(
      `${this.album().title} — ${this.tenant.dahira().name}`,
      this.tenant.absoluteUrl(`/galerie/${this.album().slug}`),
    ),
  );
}
