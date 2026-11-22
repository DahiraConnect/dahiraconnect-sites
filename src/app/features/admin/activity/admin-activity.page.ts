import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';
import { AUDIT_ACTIONS, AuditEntry, describeAudit, relativeTime, shortEmail } from '../core/labels';
import { supabase } from '../core/supabase';

/** Journal d'activité : qui a fait quoi, et quand (100 dernières actions). */
@Component({
  selector: 'app-admin-activity',
  imports: [RouterLink],
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
        .from('audit_log')
        .select('id, user_email, action, entity, entity_id, label, created_at')
        .eq('dahira_id', params)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditEntry[];
    },
  });

  /** Regroupées par jour */
  protected readonly days = computed(() => {
    const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Dakar' });
    const groups = new Map<string, AuditEntry[]>();
    for (const e of this.entries.value() ?? []) {
      const day = fmt.format(new Date(e.created_at));
      groups.set(day, [...(groups.get(day) ?? []), e]);
    }
    return [...groups].map(([day, items]) => ({ day: day[0].toUpperCase() + day.slice(1), items }));
  });

  protected readonly icon = (e: AuditEntry) => AUDIT_ACTIONS[e.action]?.icon ?? 'ph-dot';
  protected readonly describe = describeAudit;
  protected readonly who = shortEmail;
  protected readonly when = relativeTime;
}
