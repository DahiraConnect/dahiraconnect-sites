import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../core/dialog.service';

/** Affiche la demande en cours du DialogService (une seule à la fois) */
@Component({
  selector: 'app-dialog-host',
  imports: [FormsModule],
  template: `
    <dialog #dialog class="dh" [class.dh--danger]="req()?.tone === 'danger'" aria-labelledby="dh-title" aria-describedby="dh-text"
      (cancel)="$event.preventDefault(); service.close(null)">
      @if (req(); as r) {
        <span class="dh__icon" aria-hidden="true">
          <i class="ph {{ r.icon ?? (r.tone === 'danger' ? 'ph-warning' : r.input ? 'ph-pencil-simple' : 'ph-question') }}"></i>
        </span>
        <h2 id="dh-title" class="dh__title">{{ r.title }}</h2>
        @if (r.message) {
          <p id="dh-text" class="dh__text">{{ r.message }}</p>
        }
        <form (ngSubmit)="submit()" novalidate>
          @if (r.input) {
            <div class="adm-field dh__field">
              <label for="dh-input">{{ r.input.label }}</label>
              <input #field id="dh-input" name="value" [(ngModel)]="value" [placeholder]="r.input.placeholder ?? ''" autocomplete="off" />
            </div>
          }
          <div class="dh__actions">
            <button type="button" class="btn btn--outline btn--sm" (click)="service.close(null)">{{ r.cancelLabel ?? 'Annuler' }}</button>
            <button type="submit" class="btn btn--sm dh__confirm" [disabled]="!!r.input && !value.trim()">{{ r.confirmLabel }}</button>
          </div>
        </form>
      }
    </dialog>
  `,
  styleUrl: './dialog-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHost {
  protected readonly service = inject(DialogService);
  protected readonly req = this.service.current;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  protected value = '';
  protected readonly ready = signal(false);

  constructor() {
    effect(() => {
      const r = this.req();
      const el = this.dialog().nativeElement;
      if (r && !el.open) {
        this.value = r.input?.value ?? '';
        el.showModal();
        // Focus : le champ s'il y en a un, sinon « Annuler » (jamais l'action définitive par défaut)
        setTimeout(() => (el.querySelector<HTMLElement>('#dh-input') ?? el.querySelector<HTMLElement>('.btn--outline'))?.focus());
      } else if (!r && el.open) {
        el.close();
      }
    });
  }

  protected submit(): void {
    const r = this.req();
    if (!r) return;
    this.service.close(r.input ? this.value.trim() : true);
  }
}
