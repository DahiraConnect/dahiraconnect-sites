import { Injectable, computed, inject } from '@angular/core';
import { TenantService } from '../tenant/tenant.service';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly tenant = inject(TenantService);

  readonly members = computed(() =>
    [...this.tenant.bundle().board].sort((a, b) => a.order - b.order),
  );
}
