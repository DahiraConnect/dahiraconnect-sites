import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlbumService } from '../../core/data/album.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { fmtDate } from '../../core/utils/dates';
import { buildWaShare } from '../../core/utils/whatsapp';
import { ArchPhoto } from '../../shared/ui/arch-photo/arch-photo';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { Lightbox } from '../../shared/ui/lightbox/lightbox';
import { VideoPlayer } from '../../shared/ui/video-player/video-player';
import { parseVideo } from '../../core/utils/video';
import { Reveal } from '../../shared/motion/reveal.directive';
import { albumPhotoCount } from '../../core/models';

/** Album photo ou vidéo (/galerie/:album). Slug inconnu : redirigé par le résolveur de titre. */
@Component({
  selector: 'app-album-page',
  imports: [RouterLink, NgOptimizedImage, DarkHero, ArchPhoto, Lightbox, Reveal, VideoPlayer],
  templateUrl: './album.page.html',
  styleUrl: './album.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumPage {
  private readonly albums = inject(AlbumService);
  private readonly tenant = inject(TenantService);

  readonly album = input.required<string>();

  protected readonly data = computed(() => this.albums.bySlug(this.album()));
  protected readonly meta = computed(() => {
    const a = this.data();
    if (!a) return '';
    const n = albumPhotoCount(a);
    const kind =
      a.kind === 'video'
        ? ['Vidéo', this.video()?.label].filter(Boolean).join(' · ')
        : n
          ? `${n} photo${n > 1 ? 's' : ''}`
          : 'Photos';
    return [kind, fmtDate(a.date), a.place].filter(Boolean).join(' · ');
  });
  protected readonly photos = computed(() => this.data()?.photos ?? []);
  protected readonly video = computed(() => {
    const url = this.data()?.videoUrl;
    return url ? parseVideo(url) : null;
  });
  /** Photo ouverte dans la visionneuse (null = fermée) */
  protected readonly viewing = signal<number | null>(null);
  /** Albums voisins pour continuer la visite */
  protected readonly others = computed(() =>
    this.albums
      .all()
      .filter((a) => a.slug !== this.album())
      .slice(0, 3),
  );

  protected readonly shareUrl = computed(() => {
    const a = this.data();
    return a
      ? buildWaShare(`${a.title} — ${this.tenant.dahira().name}`, this.tenant.absoluteUrl(`/galerie/${a.slug}`))
      : '';
  });
}
