import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album, DahiraEvent } from '../../../core/models';
import { fmtDate } from '../../../core/utils/dates';
import { AdminAuth } from '../core/admin-auth.service';
import { listDocs } from '../core/docs';
import { AUDIT_ACTIONS, AuditEntry, clickLabel, describeAudit, pageLabel, relativeTime, shortEmail } from '../core/labels';
import { effectiveStatus } from '../core/status';
import { supabase } from '../core/supabase';
import { HelpTip } from '../ui/help-tip/help-tip';
import { StatusBadge } from '../ui/status-badge/status-badge';

interface StatRow {
  day: string;
  kind: 'view' | 'click';
  key: string;
  count: number;
}

const DAYS = 30;

/** Tableau de bord : actions rapides, chiffres du mois, contenus en attente, activité récente. */
@Component({
  selector: 'app-admin-home',
  imports: [RouterLink, HelpTip, StatusBadge],
  templateUrl: './admin-home.page.html',
  styleUrl: './admin-home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminHomePage {
  protected readonly auth = inject(AdminAuth);
  private readonly dahiraId = computed(() => this.auth.current()?.dahiraId);

  protected readonly quick = [
    { path: 'agenda/nouveau', icon: 'ph-calendar-plus', label: 'Nouvel événement' },
    { path: 'galerie/nouveau', icon: 'ph-images', label: 'Nouvel album' },
    { path: 'bureau/personnes', icon: 'ph-user-plus', label: 'Ajouter au bureau' },
  ];
  protected readonly manage = computed(() => [
    { path: 'agenda', icon: 'ph-calendar-blank', title: 'Agenda', text: 'Événements et rendez-vous' },
    { path: 'galerie', icon: 'ph-images', title: 'Galerie', text: 'Albums photos et vidéos' },
    { path: 'bureau', icon: 'ph-users-three', title: 'Bureau', text: 'Membres et commissions' },
    { path: 'equipe', icon: 'ph-user-gear', title: 'Équipe', text: 'Qui peut modifier le site' },
    ...(this.auth.current()?.role === 'owner'
      ? [{ path: 'parametres', icon: 'ph-gear-six', title: 'Paramètres', text: 'Identité, couleurs, contact' }]
      : []),
    { path: 'activite', icon: 'ph-clock-counter-clockwise', title: 'Journal', text: 'Toutes les modifications' },
  ]);

  private readonly events = resource({
    params: () => this.dahiraId(),
    loader: ({ params }) => listDocs<DahiraEvent>('events', params, 'starts_at'),
  });
  private readonly albums = resource({
    params: () => this.dahiraId(),
    loader: ({ params }) => listDocs<Album>('albums', params, 'date', false),
  });
  protected readonly stats = resource({
    params: () => this.dahiraId(),
    loader: async ({ params }) => {
      const since = new Date(Date.now() - (DAYS - 1) * 86_400_000).toISOString().slice(0, 10);
      const { data, error } = await supabase()
        .from('stats_daily')
        .select('day, kind, key, count')
        .eq('dahira_id', params)
        .gte('day', since);
      if (error) throw error;
      return data as StatRow[];
    },
  });
  protected readonly activity = resource({
    params: () => this.dahiraId(),
    loader: async ({ params }) => {
      const { data } = await supabase()
        .from('audit_log')
        .select('id, user_email, action, entity, entity_id, label, created_at')
        .eq('dahira_id', params)
        .order('created_at', { ascending: false })
        .limit(5);
      return (data ?? []) as AuditEntry[];
    },
  });

  /** Brouillons et contenus programmés */
  protected readonly pending = computed(() => [
    ...(this.events.value() ?? [])
      .filter((r) => effectiveStatus(r.status, r.publish_at) !== 'published')
      .map((r) => ({ id: r.id, link: ['agenda', r.id], icon: 'ph-calendar-blank', title: r.data.title, meta: fmtDate(r.data.startsAt), status: r.status, publishAt: r.publish_at })),
    ...(this.albums.value() ?? [])
      .filter((r) => effectiveStatus(r.status, r.publish_at) !== 'published')
      .map((r) => ({ id: r.id, link: ['galerie', r.id], icon: 'ph-images', title: r.data.title, meta: fmtDate(r.data.date), status: r.status, publishAt: r.publish_at })),
  ]);

  protected readonly nextEvent = computed(() =>
    (this.events.value() ?? []).find(
      (r) => effectiveStatus(r.status, r.publish_at) === 'published' && new Date(r.data.startsAt).getTime() > Date.now() - 3 * 3_600_000,
    ),
  );

  private readonly titles = computed(
    () =>
      new Map([
        ...(this.events.value() ?? []).map((r) => [`/agenda/${r.slug}`, r.data.title] as const),
        ...(this.albums.value() ?? []).map((r) => [`/galerie/${r.slug}`, r.data.title] as const),
      ]),
  );

  private sum(kind: 'view' | 'click', filter: (key: string) => boolean = () => true): number {
    return (this.stats.value() ?? []).filter((s) => s.kind === kind && filter(s.key)).reduce((n, s) => n + s.count, 0);
  }

  private top(kind: 'view' | 'click', label: (key: string) => string, icon: (key: string) => string) {
    const totals = new Map<string, number>();
    for (const s of this.stats.value() ?? []) if (s.kind === kind) totals.set(s.key, (totals.get(s.key) ?? 0) + s.count);
    const rows = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = rows[0]?.[1] ?? 1;
    return rows.map(([key, count]) => ({ key, count, label: label(key), icon: icon(key), width: Math.max(6, Math.round((count / max) * 100)) }));
  }

  protected readonly kpis = computed(() => [
    { icon: 'ph-eye', value: this.sum('view'), label: 'Pages vues', help: 'Chaque page ouverte sur le site compte pour 1. Anonyme : aucune donnée personnelle.' },
    { icon: 'ph-whatsapp-logo', value: this.sum('click', (k) => k.startsWith('rejoindre_')), label: 'Demandes pour rejoindre', help: 'Touchers sur « Rejoindre sur WhatsApp » ou le lien du groupe.' },
    { icon: 'ph-share-network', value: this.sum('click', (k) => k === 'partage_whatsapp'), label: 'Partages', help: 'Événements, albums ou quiz partagés sur WhatsApp.' },
  ]);
  protected readonly topPages = computed(() => this.top('view', (k) => pageLabel(k, this.titles()), () => 'ph-file'));
  protected readonly topClicks = computed(() => this.top('click', (k) => clickLabel(k).label, (k) => clickLabel(k).icon));

  /** Vues par jour (30 barres) */
  protected readonly daily = computed(() => {
    const byDay = new Map<string, number>();
    for (const s of this.stats.value() ?? []) if (s.kind === 'view') byDay.set(s.day, (byDay.get(s.day) ?? 0) + s.count);
    const days = Array.from({ length: DAYS }, (_, i) => new Date(Date.now() - (DAYS - 1 - i) * 86_400_000).toISOString().slice(0, 10));
    const max = Math.max(1, ...days.map((d) => byDay.get(d) ?? 0));
    return days.map((d) => ({ day: d, count: byDay.get(d) ?? 0, height: Math.round(((byDay.get(d) ?? 0) / max) * 100) }));
  });

  protected readonly auditIcon = (e: AuditEntry) => AUDIT_ACTIONS[e.action]?.icon ?? 'ph-dot';
  protected readonly describe = describeAudit;
  protected readonly who = shortEmail;
  protected readonly when = relativeTime;
  protected readonly fmtDate = fmtDate;
}
