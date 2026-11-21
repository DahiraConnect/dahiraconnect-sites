import { Injectable, computed, inject } from '@angular/core';
import { TenantService } from '../tenant/tenant.service';
import { buildBoardView } from './board';

/** Bureau du dahira : bureau exécutif et commissions. */
@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly tenant = inject(TenantService);

  readonly view = computed(() => buildBoardView(this.tenant.bundle().board));
  readonly executive = computed(() => this.view().executive);
  readonly commissions = computed(() => this.view().commissions);
}
