import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** État vide : une icône, une phrase, une action (bouton ou lien projeté) */
@Component({
  selector: 'app-empty-state',
  template: `<i class="ph {{ icon() }}" aria-hidden="true"></i><ng-content />`,
  host: { class: 'adm-empty-state' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input('ph-tray');
}
