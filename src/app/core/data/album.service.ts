import { Injectable, computed, inject } from '@angular/core';
import { Album } from '../models';
import { TenantService } from '../tenant/tenant.service';

@Injectable({ providedIn: 'root' })
export class AlbumService {
  private readonly tenant = inject(TenantService);

  /** Album mis en avant d'abord, puis du plus récent au plus ancien. */
  readonly all = computed(() =>
    [...this.tenant.bundle().albums].sort(
      (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.date.localeCompare(a.date),
    ),
  );

  bySlug(slug: string): Album | undefined {
    return this.all().find((a) => a.slug === slug);
  }
}
