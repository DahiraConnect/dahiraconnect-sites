import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Person, Photo } from '../../../core/models';
import { initials } from '../../../core/data/board';
import { DahiraDocStore } from '../core/dahira-doc.store';
import { removePhoto } from '../core/images';
import { PhotoPicker } from '../ui/photo-picker/photo-picker';

/** Personnes du bureau : nom et photo (facultative), décrites une seule fois. */
@Component({
  selector: 'app-admin-people',
  imports: [FormsModule, RouterLink, PhotoPicker, NgTemplateOutlet],
  templateUrl: './admin-people.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminPeoplePage {
  protected readonly store = inject(DahiraDocStore);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  /** Fiche ouverte : id d'une personne, 'new', ou rien */
  protected readonly editing = signal<string | null>(null);
  protected name = '';
  protected readonly photo = signal<Photo[]>([]);
  protected readonly initials = initials;

  protected readonly people = computed(() =>
    [...(this.store.board()?.people ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  );
  /** Postes de chaque personne (pour l'aperçu et la suppression) */
  protected readonly posts = computed(() => {
    const b = this.store.board();
    const map = new Map<string, string[]>();
    if (!b) return map;
    const add = (id: string, label: string) => map.set(id, [...(map.get(id) ?? []), label]);
    b.executive.forEach((p) => add(p.personId, p.role ?? 'Bureau exécutif'));
    b.commissions.forEach((c) => c.members.forEach((m) => add(m.personId, m.role ? `${m.role} (${c.name})` : c.name)));
    return map;
  });

  constructor() {
    this.store.load().finally(() => this.loading.set(false));
  }

  protected open(person?: Person): void {
    this.error.set('');
    this.editing.set(person?.id ?? 'new');
    this.name = person?.name ?? '';
    this.photo.set(person?.photoUrl ? [{ url: person.photoUrl, alt: person.name, width: 1, height: 1 }] : []);
  }

  protected close(): void {
    this.editing.set(null);
  }

  protected async save(): Promise<void> {
    const b = this.store.board();
    const name = this.name.trim().replace(/\s+/g, ' ');
    if (!b) return;
    if (!name) {
      this.error.set('Indiquez le prénom et le nom.');
      return;
    }
    const id = this.editing();
    const photoUrl = this.photo()[0]?.thumbUrl ?? this.photo()[0]?.url;
    const previous = b.people.find((p) => p.id === id);
    const person: Person = { id: previous?.id ?? `p-${crypto.randomUUID().slice(0, 8)}`, name, ...(photoUrl ? { photoUrl } : {}) };
    const people = previous ? b.people.map((p) => (p.id === id ? person : p)) : [...b.people, person];
    this.busy.set(true);
    const ok = await this.store.saveBoard({ ...b, people }, previous ? 'Personne modifiée' : 'Personne ajoutée');
    this.busy.set(false);
    if (!ok) {
      this.error.set('L’enregistrement a échoué. Réessayez.');
      return;
    }
    if (previous?.photoUrl && previous.photoUrl !== photoUrl) void removePhoto({ url: previous.photoUrl, alt: '', width: 0, height: 0 });
    this.close();
  }

  protected async remove(person: Person): Promise<void> {
    const b = this.store.board();
    if (!b) return;
    const posts = this.posts().get(person.id) ?? [];
    const warning = posts.length ? `\nCette personne sera aussi retirée de : ${posts.join(', ')}.` : '';
    if (!confirm(`Retirer ${person.name} du bureau ?${warning}`)) return;
    this.busy.set(true);
    const ok = await this.store.saveBoard(
      {
        people: b.people.filter((p) => p.id !== person.id),
        executive: b.executive.filter((p) => p.personId !== person.id),
        commissions: b.commissions.map((c) => ({ ...c, members: c.members.filter((m) => m.personId !== person.id) })),
      },
      'Personne retirée',
    );
    this.busy.set(false);
    if (ok) this.close();
    else this.error.set('La suppression a échoué. Réessayez.');
  }
}
