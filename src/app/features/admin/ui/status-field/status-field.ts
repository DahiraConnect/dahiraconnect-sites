import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PubStatus } from '../../core/status';
import { fromIso, toIso } from '../../core/slug';

/**
 * Visibilité : Publié ou Brouillon. « Publier plus tard » (date à venir) donne un contenu programmé,
 * avec une phrase claire : « Visible sur le site le jeudi 12 décembre à 8 h 00 ».
 */
@Component({
  selector: 'app-status-field',
  imports: [FormsModule],
  templateUrl: './status-field.html',
  styleUrl: './status-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusField {
  readonly status = model<PubStatus>('published');
  /** ISO, seulement pour une mise en ligne plus tard */
  readonly publishAt = model<string | null>(null);
  readonly error = input('');
  readonly idPrefix = input('st');

  protected readonly mode = computed<'published' | 'draft'>(() => (this.status() === 'draft' ? 'draft' : 'published'));
  protected readonly later = computed(() => this.status() === 'scheduled');
  protected readonly date = linkedSignal(() => (this.publishAt() ? fromIso(this.publishAt()!).date : ''));
  protected readonly time = linkedSignal(() => (this.publishAt() ? fromIso(this.publishAt()!).time : '08:00'));

  /** Phrase sous le choix */
  protected readonly hint = computed(() => {
    if (this.mode() === 'draft') return 'Invisible sur le site. Vous pourrez le publier plus tard.';
    const at = this.publishAt();
    if (this.later() && at) {
      const when = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar',
      }).format(new Date(at));
      return new Date(at).getTime() > Date.now()
        ? `Sera visible sur le site le ${when.replace(/(\d{2}):(\d{2})/, (_, h, m) => `${Number(h)} h ${m}`)}, tout seul.`
        : 'Cette date est passée : le contenu sera visible tout de suite.';
    }
    if (this.later()) return 'Choisissez le jour et l’heure de mise en ligne.';
    return 'Visible sur le site 2 à 3 minutes après l’enregistrement.';
  });

  protected setMode(mode: 'published' | 'draft'): void {
    this.status.set(mode === 'draft' ? 'draft' : this.later() ? 'scheduled' : 'published');
  }

  protected setLater(later: boolean): void {
    this.status.set(later ? 'scheduled' : 'published');
    if (later && !this.publishAt()) {
      // Par défaut : demain à 8 h
      const d = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
      this.publishAt.set(toIso(d, '08:00'));
    }
  }

  protected setDate(value: string): void {
    this.date.set(value);
    this.sync();
  }

  protected setTime(value: string): void {
    this.time.set(value);
    this.sync();
  }

  private sync(): void {
    this.publishAt.set(this.date() ? toIso(this.date(), this.time() || '08:00') : null);
  }
}
