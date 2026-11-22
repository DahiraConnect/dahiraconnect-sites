import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, resource } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DahiraEvent } from '../../../core/models';
import { TenantService } from '../../../core/tenant/tenant.service';
import { fmtDate, fmtEventTime } from '../../../core/utils/dates';
import { AdminAuth } from '../core/admin-auth.service';
import { getDoc } from '../core/docs';
import { formatLocal, toWhatsappNumber } from '../core/phone';
import { supabase } from '../core/supabase';
import type { Participant } from './admin-participants.page';

/**
 * Liste des participants prête à imprimer (A4) ou à enregistrer en PDF :
 * en-tête avec logo, tableau numéroté avec case « Présent », total.
 */
@Component({
  selector: 'app-admin-participants-print',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './admin-participants-print.page.html',
  styleUrl: './admin-participants-print.page.scss',
  // Les règles d'impression masquent aussi la barre de l'admin
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminParticipantsPrintPage {
  private readonly auth = inject(AdminAuth);
  private readonly site = inject(TenantService).dahira;
  readonly id = input.required<string>();

  protected readonly dahira = computed(() => this.auth.current()?.profile ?? this.site());
  protected readonly event = resource({
    params: () => this.id(),
    loader: ({ params }) => getDoc<DahiraEvent>('events', params),
  });
  protected readonly list = resource({
    params: () => this.id(),
    loader: async ({ params }) => {
      const { data, error } = await supabase()
        .from('site_inscriptions')
        .select('id, first_name:prenom, last_name:nom, phone:telephone, people:personnes, source, created_at')
        .eq('evenement_id', params)
        .order('nom')
        .order('prenom');
      if (error) throw error;
      return data as Participant[];
    },
  });

  protected readonly total = computed(() => (this.list.value() ?? []).reduce((n, p) => n + p.people, 0));
  protected readonly showPhone = computed(() => (this.list.value() ?? []).some((p) => p.phone));
  protected readonly showPeople = computed(() => (this.list.value() ?? []).some((p) => p.people > 1));
  protected readonly when = computed(() => {
    const e = this.event.value()?.data;
    return e ? `${fmtDate(e.startsAt)} · ${fmtEventTime(e)}` : '';
  });
  protected readonly printedAt = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Africa/Dakar',
  }).format(new Date());

  protected readonly phoneLabel = (p: string) => formatLocal(toWhatsappNumber(p) || p);

  protected print(): void {
    window.print();
  }
}
