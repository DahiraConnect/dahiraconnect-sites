import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';

let nextId = 0;

/**
 * Bulle d'aide « ? » : s'ouvre au toucher (pas de survol sur téléphone),
 * se ferme avec Échap, un toucher ailleurs ou un second toucher.
 */
@Component({
  selector: 'app-help-tip',
  template: `
    <button type="button" class="tip__btn" [attr.aria-expanded]="open()" [attr.aria-controls]="id"
      (click)="open.set(!open())" aria-label="Aide">
      <i class="ph ph-question" aria-hidden="true"></i>
    </button>
    @if (open()) {
      <span class="tip__bubble" [id]="id" role="note"><ng-content /></span>
    }
  `,
  styleUrl: './help-tip.scss',
  host: {
    '(document:click)': 'onDocClick($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpTip {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly id = `tip-${nextId++}`;
  protected readonly open = signal(false);

  protected onDocClick(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
