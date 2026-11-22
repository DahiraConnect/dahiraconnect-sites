import { EmptyState } from '../ui/empty-state/empty-state';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Position } from '../../../core/models';
import { DahiraDocStore } from '../core/dahira-doc.store';

/**
 * Postes d'un groupe : bureau exécutif (sans paramètre) ou une commission (`:id`).
 * Chaque ligne = une personne + son rôle. Une personne peut apparaître dans plusieurs groupes.
 */
@Component({
  selector: 'app-admin-group',
  imports: [EmptyState, FormsModule, RouterLink],
  templateUrl: './admin-group.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminGroupPage {
  protected readonly store = inject(DahiraDocStore);
  private readonly router = inject(Router);

  /** Identifiant de la commission ; absent = bureau exécutif */
  readonly id = input<string>();

  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly rows = signal<Position[]>([]);
  protected name = '';
  protected description = '';

  protected readonly isExecutive = computed(() => !this.id());
  protected readonly commission = computed(() => this.store.board()?.commissions.find((c) => c.id === this.id()));
  protected readonly people = computed(() =>
    [...(this.store.board()?.people ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  );

  constructor() {
    this.store.load().finally(() => this.loading.set(false));
    // Copie de travail, remplie quand le bureau est chargé
    effect(() => {
      const board = this.store.board();
      if (!board) return;
      const c = this.commission();
      this.rows.set(structuredClone(this.isExecutive() ? board.executive : (c?.members ?? [])));
      this.name = c?.name ?? '';
      this.description = c?.description ?? '';
    });
  }

  protected add(): void {
    this.rows.update((r) => [...r, { personId: '', role: '' }]);
    setTimeout(() => document.querySelector<HTMLElement>(`#row-${this.rows().length - 1}-person`)?.focus());
  }

  protected removeRow(i: number): void {
    this.rows.update((r) => r.filter((_, j) => j !== i));
  }

  protected move(i: number, delta: number): void {
    this.rows.update((r) => {
      const next = [...r];
      const [item] = next.splice(i, 1);
      next.splice(i + delta, 0, item);
      return next;
    });
  }

  protected async save(): Promise<void> {
    const board = this.store.board();
    if (!board) return;
    const rows = this.rows()
      .filter((r) => r.personId)
      .map((r) => ({
        personId: r.personId,
        ...(r.role?.trim() ? { role: r.role.trim() } : {}),
        ...(r.lead ? { lead: true } : {}),
      }));
    if (this.isExecutive() && rows.some((r) => !r.role)) {
      this.error.set('Indiquez le poste de chaque personne (ex. : Président).');
      return;
    }
    if (!this.isExecutive() && !this.name.trim()) {
      this.error.set('Indiquez le nom de la commission.');
      return;
    }
    this.error.set('');
    this.busy.set(true);
    const next = this.isExecutive()
      ? { ...board, executive: rows }
      : {
          ...board,
          commissions: board.commissions.map((c) =>
            c.id === this.id()
              ? { ...c, name: this.name.trim(), description: this.description.trim() || undefined, members: rows }
              : c,
          ),
        };
    const ok = await this.store.saveBoard(next, this.isExecutive() ? 'Bureau exécutif enregistré' : 'Commission enregistrée');
    this.busy.set(false);
    if (ok) await this.router.navigateByUrl('/admin/bureau');
    else this.error.set('L’enregistrement a échoué. Réessayez.');
  }

  protected async removeCommission(): Promise<void> {
    const board = this.store.board();
    const c = this.commission();
    if (!board || !c || !confirm(`Supprimer la commission « ${c.name} » ? Les personnes restent dans le bureau.`)) return;
    this.busy.set(true);
    const ok = await this.store.saveBoard(
      { ...board, commissions: board.commissions.filter((x) => x.id !== c.id) },
      'Commission supprimée',
    );
    this.busy.set(false);
    if (ok) await this.router.navigateByUrl('/admin/bureau');
  }
}
