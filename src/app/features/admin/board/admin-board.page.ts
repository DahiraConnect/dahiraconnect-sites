import { EmptyState } from '../ui/empty-state/empty-state';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Commission } from '../../../core/models';
import { DahiraDocStore } from '../core/dahira-doc.store';
import { slugify, uniqueSlug } from '../core/slug';

/** Bureau : personnes, bureau exécutif, commissions. */
@Component({
  selector: 'app-admin-board',
  imports: [EmptyState, RouterLink],
  templateUrl: './admin-board.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminBoardPage {
  protected readonly store = inject(DahiraDocStore);
  private readonly router = inject(Router);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);

  protected readonly board = this.store.board;
  protected readonly execNames = computed(() => {
    const b = this.board();
    if (!b) return '';
    const names = new Map(b.people.map((p) => [p.id, p.name]));
    return b.executive.map((p) => `${p.role ?? ''} : ${names.get(p.personId) ?? '?'}`).join(' · ');
  });

  constructor() {
    this.store.load().finally(() => this.loading.set(false));
  }

  protected async addCommission(): Promise<void> {
    const b = this.board();
    const name = prompt('Nom de la nouvelle commission (ex. : Commission sociale)')?.trim();
    if (!b || !name) return;
    this.busy.set(true);
    const id = uniqueSlug(slugify(name), b.commissions.map((c) => c.id));
    const commission: Commission = { id, name, members: [] };
    const ok = await this.store.saveBoard({ ...b, commissions: [...b.commissions, commission] }, 'Commission ajoutée');
    this.busy.set(false);
    if (ok) await this.router.navigate(['/admin/bureau/commission', id]);
  }
}
