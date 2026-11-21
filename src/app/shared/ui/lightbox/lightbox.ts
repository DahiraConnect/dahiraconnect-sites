import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  model,
  input,
  viewChild,
} from '@angular/core';
import { Photo } from '../../../core/models';

/**
 * Visionneuse plein écran (<dialog> natif) : flèches, clavier ←/→, glisser du doigt, Échap.
 * Ouvrir : `[(index)]="i"` avec un numéro de photo ; `null` = fermée.
 */
@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lightbox {
  readonly photos = input.required<Photo[]>();
  readonly title = input<string>('');
  readonly index = model<number | null>(null);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private startX: number | null = null;

  protected readonly current = computed(() => {
    const i = this.index();
    return i === null ? undefined : this.photos()[i];
  });
  /** Liste à un élément : recrée l'<img> à chaque photo pour rejouer l'animation */
  protected readonly frame = computed(() => {
    const photo = this.current();
    return photo ? [photo] : [];
  });

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      const open = this.index() !== null;
      if (open && !dialog.open) dialog.showModal();
      if (!open && dialog.open) dialog.close();
    });
  }

  protected go(step: number): void {
    const i = this.index();
    if (i === null) return;
    const count = this.photos().length;
    this.index.set((i + step + count) % count);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.go(1);
    if (event.key === 'ArrowLeft') this.go(-1);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.startX = event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.startX === null) return;
    const delta = event.clientX - this.startX;
    this.startX = null;
    if (Math.abs(delta) > 50) this.go(delta < 0 ? 1 : -1);
  }

  /** Clic sur le fond (hors image et boutons) : fermer */
  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.index.set(null);
  }
}
