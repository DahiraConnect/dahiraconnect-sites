import { EmptyState } from '../ui/empty-state/empty-state';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';
import { AUDIT_ACTIONS, AuditEntry, describeAudit, relativeTime, whoDid } from '../core/labels';
import { matches } from '../core/search';
import { supabase } from '../core/supabase';

/** Journal d'activité : qui a fait quoi, et quand (100 dernières actions). */
@Component({
  selector: 'app-admin-activity',
  imports: [EmptyState, RouterLink],
  templateUrl: './admin-activity.page.html',
  styleUrl: './admin-activity.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminActivityPage {
  private readonly auth = inject(AdminAuth);

  protected readonly entries = resource({
    params: () => this.auth.current()?.dahiraId,
    loader: async ({ params }) => {
      const { data, error } = await supabase()
        .from('site_journal')
        .select('id, user_name:auteur, action, entity:entite, entity_id:entite_id, label:libelle, created_at')
        .eq('dahira_id', params)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditEntry[];
    },
  });

  protected readonly query = signal('');

  /** Regroupées par jour */
  protected readonly days = computed(() => {
    const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Dakar' });
    const groups = new Map<string, AuditEntry[]>();
    for (const e of (this.entries.value() ?? []).filter((x) => matches(this.query(), whoDid(x), describeAudit(x)))) {
      const day = fmt.format(new Date(e.created_at));
      groups.set(day, [...(groups.get(day) ?? []), e]);
    }
    return [...groups].map(([day, items]) => ({ day: day[0].toUpperCase() + day.slice(1), items }));
  });

  protected readonly icon = (e: AuditEntry) => AUDIT_ACTIONS[e.action]?.icon ?? 'ph-dot';
  protected readonly describe = describeAudit;
  protected readonly who = whoDid;
  protected readonly when = relativeTime;
}
