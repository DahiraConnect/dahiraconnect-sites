import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';

/** Fenêtre d'aperçu (dialogue natif : Échap ferme, le focus reste dedans) */
@Component({
  selector: 'app-preview-dialog',
  template: `
    <dialog #dialog class="pv" [attr.aria-label]="title()" (close)="closed.emit()" (click)="onBackdrop($event)">
      <div class="pv__head">
        <p class="pv__title"><i class="ph ph-eye" aria-hidden="true"></i> {{ title() }}</p>
        <button type="button" class="pv__close" (click)="dialog.close()" aria-label="Fermer l’aperçu">
          <i class="ph ph-x" aria-hidden="true"></i>
        </button>
      </div>
      <p class="pv__note">Voici comment ce sera affiché sur le site.</p>
      <div class="pv__body"><ng-content /></div>
      <button type="button" class="btn btn--dark pv__ok" (click)="dialog.close()">C’est bon</button>
    </dialog>
  `,
  styles: `
    .pv {
      width: min(560px, calc(100vw - 24px));
      max-height: calc(100dvh - 24px);
      padding: var(--space-4);
      border: 0;
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      color: var(--color-text-primary);
      box-shadow: var(--shadow-dock);
    }
    .pv::backdrop { background: rgb(6 39 17 / 0.55); }
    .pv__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
    .pv__title { display: flex; align-items: center; gap: 8px; margin: 0; font-weight: 700; font-size: var(--fs-body-lg); }
    .pv__close {
      display: grid; place-items: center; width: var(--tap-min); height: var(--tap-min);
      border: 0; border-radius: 50%; background: var(--color-surface-muted); color: var(--color-primary);
      font-size: 22px; cursor: pointer;
    }
    .pv__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
    .pv__note { margin: var(--space-1) 0 var(--space-4); color: var(--color-text-secondary); font-size: var(--fs-small); }
    .pv__body { display: grid; gap: var(--space-4); }
    .pv__ok { width: 100%; margin-top: var(--space-5); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewDialog {
  readonly title = input('Aperçu');
  readonly closed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  /** Toucher le fond sombre ferme l'aperçu */
  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.dialog().nativeElement.close();
  }
}
