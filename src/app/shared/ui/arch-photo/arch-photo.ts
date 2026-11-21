import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ArchFallback = 'green' | 'gold' | 'blue' | 'sage';

/**
 * Photo en arche. Sans image : aplat de couleur (+ motif étoilé sur le vert).
 * Remplit son hôte : le parent fixe largeur et hauteur.
 */
@Component({
  selector: 'app-arch-photo',
  imports: [NgOptimizedImage],
  templateUrl: './arch-photo.html',
  styleUrl: './arch-photo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"arch arch--" + fallback()' },
})
export class ArchPhoto {
  readonly src = input<string>();
  readonly alt = input<string>('');
  readonly fallback = input<ArchFallback>('green');
  /** '64 photos' */
  readonly badge = input<string>('');
  /** Bouton lecture centré (vidéo) */
  readonly play = input<boolean>(false);
  readonly sizes = input<string>('(min-width: 1024px) 50vw, 90vw');

  protected readonly darkBadge = computed(() => ['gold', 'sage'].includes(this.fallback()));
}
