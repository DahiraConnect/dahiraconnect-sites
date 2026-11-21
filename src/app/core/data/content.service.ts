import { Injectable, computed, inject } from '@angular/core';
import { TenantService } from '../tenant/tenant.service';

/** Textes de pages, histoire et lignée. */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly tenant = inject(TenantService);

  readonly home = computed(() => this.tenant.bundle().content.home);
  readonly about = computed(() => this.tenant.bundle().content.about);
  readonly guide = computed(() => this.tenant.bundle().content.guide);
  readonly join = computed(() => this.tenant.bundle().content.join);
  readonly charter = computed(() => this.tenant.bundle().content.charter);
}
