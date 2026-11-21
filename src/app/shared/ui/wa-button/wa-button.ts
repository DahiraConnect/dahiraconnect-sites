import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TenantService } from '../../../core/tenant/tenant.service';
import { buildWaLink } from '../../../core/utils/whatsapp';

/** Bouton « Rejoindre » : ouvre WhatsApp avec le message prérempli (aucun formulaire). */
@Component({
  selector: 'app-wa-button',
  templateUrl: './wa-button.html',
  styleUrl: './wa-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaButton {
  readonly label = input<string>('Rejoindre sur WhatsApp');
  readonly variant = input<'brand' | 'dark' | 'light'>('brand');
  readonly size = input<'md' | 'lg'>('md');

  private readonly tenant = inject(TenantService);

  protected readonly href = computed(() => {
    const join = this.tenant.dahira().join;
    return join.mode === 'group' && join.groupInviteUrl
      ? join.groupInviteUrl
      : buildWaLink(join.whatsappNumber, join.prefilledMessage);
  });
}
