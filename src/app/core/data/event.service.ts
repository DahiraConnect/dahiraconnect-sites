import { Injectable, computed, inject } from '@angular/core';
import { DahiraEvent } from '../models';
import { TenantService } from '../tenant/tenant.service';

/** Un événement reste « à venir » jusqu'à sa fin (ou 3 h après son début). */
const DEFAULT_DURATION_MS = 3 * 3_600_000;
const endOf = (e: DahiraEvent) =>
  e.endsAt ? new Date(e.endsAt).getTime() : new Date(e.startsAt).getTime() + DEFAULT_DURATION_MS;

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly tenant = inject(TenantService);
  private readonly now = Date.now();

  readonly all = computed(() =>
    [...this.tenant.bundle().events].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  );
  readonly upcoming = computed(() => this.all().filter((e) => endOf(e) >= this.now));
  readonly past = computed(() =>
    this.all()
      .filter((e) => endOf(e) < this.now)
      .reverse(),
  );
  readonly next = computed<DahiraEvent | undefined>(() => this.upcoming()[0]);

  bySlug(slug: string): DahiraEvent | undefined {
    return this.all().find((e) => e.slug === slug);
  }

  isPast(event: DahiraEvent): boolean {
    return endOf(event) < this.now;
  }
}
