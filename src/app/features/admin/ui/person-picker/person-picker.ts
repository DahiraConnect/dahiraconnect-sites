import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { postsOf } from '../../../../core/data/board';
import { Board } from '../../../../core/models';
import { matches } from '../../core/search';

/** Choix : une personne existante du bureau, ou un nouveau nom à créer */
export type PersonChoice = { kind: 'existing'; id: string; name: string } | { kind: 'new'; name: string } | null;

let uid = 0;

/**
 * Recherche d'une personne du bureau avec suggestions (combobox accessible).
 * Dernière option : « Ajouter « … » au bureau » si le nom n'existe pas.
 */
@Component({
  selector: 'app-person-picker',
  templateUrl: './person-picker.html',
  styleUrl: './person-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonPicker {
  readonly board = input<Board | null | undefined>();
  readonly label = input('Qui est-ce ?');
  readonly value = model<PersonChoice>(null);

  protected readonly id = `pp-${uid++}`;
  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly active = signal(0);

  protected readonly results = computed(() => {
    const q = this.query().trim();
    if (!q) return [];
    return (this.board()?.people ?? [])
      .filter((p) => matches(q, p.name))
      .slice(0, 6)
      .map((p) => ({ ...p, posts: postsOf(this.board(), p.id) }));
  });
  /** Proposer la création si aucun nom ne correspond exactement */
  protected readonly canCreate = computed(() => {
    const q = this.query().trim();
    return q.split(/\s+/).length >= 2 && !this.results().some((p) => p.name.toLowerCase() === q.toLowerCase());
  });
  protected readonly count = computed(() => this.results().length + (this.canCreate() ? 1 : 0));

  protected onInput(text: string): void {
    this.query.set(text);
    this.value.set(null);
    this.active.set(0);
    this.open.set(!!text.trim());
  }

  protected pick(index: number): void {
    const r = this.results();
    if (index < r.length) this.value.set({ kind: 'existing', id: r[index].id, name: r[index].name });
    else if (this.canCreate()) this.value.set({ kind: 'new', name: this.query().trim().replace(/\s+/g, ' ') });
    this.open.set(false);
  }

  protected clear(): void {
    this.value.set(null);
    this.query.set('');
  }

  protected key(e: KeyboardEvent): void {
    if (!this.open() || !this.count()) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.active.update((i) => (i + 1) % this.count());
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.active.update((i) => (i - 1 + this.count()) % this.count());
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.pick(this.active());
    } else if (e.key === 'Escape') {
      this.open.set(false);
    }
  }
}
