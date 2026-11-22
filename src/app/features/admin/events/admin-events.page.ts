import { EmptyState } from '../ui/empty-state/empty-state';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DahiraEvent } from '../../../core/models';
import { fmtDate, fmtEventTime } from '../../../core/utils/dates';
import { AdminAuth } from '../core/admin-auth.service';
import { listDocs } from '../core/docs';
import { matches } from '../core/search';
import { StatusBadge } from '../ui/status-badge/status-badge';

/** Liste des événements : à venir d'abord, puis les passés. */
@Component({
  selector: 'app-admin-events',
  imports: [EmptyState, RouterLink, NgTemplateOutlet, StatusBadge],
  templateUrl: './admin-events.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminEventsPage {
  private readonly auth = inject(AdminAuth);
  private readonly now = Date.now();

  protected readonly rows = resource({
    params: () => this.auth.current()?.dahiraId,
    loader: ({ params }) => listDocs<DahiraEvent>('events', params, 'starts_at'),
  });
  protected readonly query = signal('');
  private readonly found = computed(() =>
    (this.rows.value() ?? []).filter((r) => matches(this.query(), r.data.title, r.data.place, r.data.description)),
  );
  protected readonly upcoming = computed(() =>
    this.found().filter((r) => new Date(r.data.endsAt ?? r.data.startsAt).getTime() >= this.now - 3 * 3_600_000),
  );
  protected readonly past = computed(() =>
    this.found().filter((r) => !this.upcoming().includes(r)).reverse(),
  );

  protected readonly when = (e: DahiraEvent) => `${fmtDate(e.startsAt)} · ${fmtEventTime(e)}`;
}
