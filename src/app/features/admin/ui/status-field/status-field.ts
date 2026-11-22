import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PubStatus, STATUS_INFO } from '../../core/status';
import { fromIso, toIso } from '../../core/slug';

/** Choix du statut : Brouillon / Publié / Programmé (+ date et heure de mise en ligne). */
@Component({
  selector: 'app-status-field',
  imports: [FormsModule],
  templateUrl: './status-field.html',
  styleUrl: './status-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusField {
  readonly status = model<PubStatus>('published');
  /** ISO, seulement pour « Programmé » */
  readonly publishAt = model<string | null>(null);
  readonly error = input('');
  /** Préfixe des identifiants (plusieurs formulaires sur une page) */
  readonly idPrefix = input('st');

  protected readonly options = (['published', 'draft', 'scheduled'] as PubStatus[]).map((id) => ({ id, ...STATUS_INFO[id] }));
  protected readonly date = linkedSignal(() => (this.publishAt() ? fromIso(this.publishAt()!).date : ''));
  protected readonly time = linkedSignal(() => (this.publishAt() ? fromIso(this.publishAt()!).time : '08:00'));
  protected readonly name = computed(() => `${this.idPrefix()}-status`);

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
