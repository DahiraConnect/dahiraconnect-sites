import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PubStatus, STATUS_INFO, effectiveStatus } from '../../core/status';

/** Pastille de statut : icône + mot (jamais la couleur seule) */
@Component({
  selector: 'app-status-badge',
  template: `<i class="ph {{ info().icon }}" aria-hidden="true"></i>{{ info().label }}`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px 3px 8px;
      border-radius: var(--radius-pill);
      font: 700 var(--fs-small) / 1.2 var(--font-body);
      white-space: nowrap;
    }
    :host(.is-published) { background: #dcefe0; color: #0b5a26; }
    :host(.is-draft) { background: var(--color-surface-muted); color: var(--color-text-secondary); }
    :host(.is-scheduled) { background: #f7e7b5; color: #6b500c; }
    .ph { font-size: 16px; }
  `,
  host: { '[class]': '"is-" + status()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly value = input.required<PubStatus>();
  readonly publishAt = input<string | null>(null);
  protected readonly status = computed(() => effectiveStatus(this.value(), this.publishAt()));
  protected readonly info = computed(() => STATUS_INFO[this.status()]);
}
