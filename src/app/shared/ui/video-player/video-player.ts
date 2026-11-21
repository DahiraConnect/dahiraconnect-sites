import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { VideoInfo } from '../../../core/utils/video';

/**
 * Vidéo TikTok / YouTube « au clic » : image + bouton lecture, le lecteur (lourd en 3G,
 * avec traceurs) n'est chargé que si la personne appuie. Lien direct vers l'application en plus.
 */
@Component({
  selector: 'app-video-player',
  imports: [NgOptimizedImage],
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayer {
  private readonly sanitizer = inject(DomSanitizer);

  readonly video = input.required<VideoInfo>();
  readonly title = input.required<string>();
  /** Image de couverture (sinon vignette YouTube, sinon aplat) */
  readonly cover = input<string>();

  protected readonly playing = signal(false);
  protected readonly poster = computed(() => this.cover() ?? this.video().thumbnailUrl);
  protected readonly icon = computed(() =>
    this.video().platform === 'tiktok' ? 'ph-tiktok-logo' : this.video().platform === 'youtube' ? 'ph-youtube-logo' : 'ph-play',
  );
  /** Adresse construite par parseVideo (YouTube nocookie / TikTok uniquement) */
  protected readonly embed = computed(() => {
    const url = this.video().embedUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
}
