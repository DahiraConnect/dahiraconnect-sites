import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album, DahiraEvent } from '../../../core/models';
import { fmtDate } from '../../../core/utils/dates';
import { AdminAuth } from '../core/admin-auth.service';
import { listDocs } from '../core/docs';
import { AUDIT_ACTIONS, AuditEntry, clickLabel, describeAudit, pageLabel, relativeTime, whoDid } from '../core/labels';
import { effectiveStatus } from '../core/status';
import { supabase } from '../core/supabase';
import type { ChartConfiguration } from 'chart.js';
import { ChartView } from '../ui/chart/chart';
import { HelpTip } from '../ui/help-tip/help-tip';
import { StatusBadge } from '../ui/status-badge/status-badge';

interface StatRow {
  day: string;
  kind: 'view' | 'click' | 'device';
  key: string;
  count: number;
}

const DAYS = 30;

/** Tableau de bord : actions rapides, chiffres du mois, contenus en attente, activité récente. */
@Component({
  selector: 'app-admin-home',
  imports: [RouterLink, HelpTip, StatusBadge, ChartView],
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
    { path: 'annonce', icon: 'ph-megaphone-simple', label: 'Annonce' },
  ];
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
        .select('id, user_email, user_name, action, entity, entity_id, label, created_at')
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
    { icon: 'ph-eye', value: this.sum('view'), label: 'Visites', help: 'Chaque page ouverte sur le site compte pour 1. Anonyme : aucune donnée personnelle.' },
    { icon: 'ph-whatsapp-logo', value: this.sum('click', (k) => k.startsWith('rejoindre_')), label: 'Veulent nous rejoindre', help: 'Personnes qui ont touché « Rejoindre sur WhatsApp » ou le lien du groupe.' },
    { icon: 'ph-share-network', value: this.sum('click', (k) => k === 'partage_whatsapp'), label: 'Partages', help: 'Événements, albums ou quiz partagés sur WhatsApp.' },
  ]);

  /** Bonjour + date du jour */
  protected readonly today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Dakar' })
    .format(new Date())
    .replace(/^./, (c) => c.toUpperCase());

  private css(name: string, fallback: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  /** Visites par jour (barres) */
  protected readonly dailyChart = computed<ChartConfiguration>(() => {
    const days = this.daily();
    const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    return {
      type: 'bar',
      data: {
        labels: days.map((d) => fmt.format(new Date(d.day))),
        datasets: [{ label: 'Visites', data: days.map((d) => d.count), backgroundColor: this.css('--color-primary-mid', '#0F5C27'), borderRadius: 4, maxBarThickness: 18 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 500 },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 6, maxRotation: 0 } },
          y: { beginAtZero: true, ticks: { precision: 0, maxTicksLimit: 4 }, grid: { color: 'rgba(0,0,0,0.06)' } },
        },
      },
    };
  });

  /** Téléphone, ordinateur ou tablette (visites) */
  protected readonly devices = computed(() => {
    const count = (d: string) => (this.stats.value() ?? []).filter((s) => s.kind === 'device' && s.key === `view:${d}`).reduce((n, s) => n + s.count, 0);
    const rows = [
      { key: 'mobile', label: 'Téléphone', icon: 'ph-device-mobile', value: count('mobile'), color: this.css('--color-primary-mid', '#0F5C27') },
      { key: 'desktop', label: 'Ordinateur', icon: 'ph-desktop', value: count('desktop'), color: this.css('--color-gold', '#E2B743') },
      { key: 'tablet', label: 'Tablette', icon: 'ph-device-tablet', value: count('tablet'), color: '#7C8CD6' },
    ];
    const total = rows.reduce((n, r) => n + r.value, 0);
    return { total, rows: rows.map((r) => ({ ...r, pct: total ? Math.round((r.value / total) * 100) : 0 })) };
  });

  protected readonly deviceChart = computed<ChartConfiguration>(() => {
    const d = this.devices();
    return {
      type: 'doughnut',
      data: {
        labels: d.rows.map((r) => r.label),
        datasets: [{ data: d.rows.map((r) => r.value), backgroundColor: d.rows.map((r) => r.color), borderWidth: 0 }],
      },
      options: { cutout: '68%', plugins: { legend: { display: false } }, animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 500 } },
    };
  });

  /** « 8 visites sur 10 depuis un téléphone » */
  protected readonly deviceSentence = computed(() => {
    const mobile = this.devices().rows[0];
    const per10 = Math.round(mobile.pct / 10);
    return `${per10} visite${per10 > 1 ? 's' : ''} sur 10 depuis un téléphone`;
  });
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
  protected readonly who = whoDid;
  protected readonly when = relativeTime;
  protected readonly fmtDate = fmtDate;
}
