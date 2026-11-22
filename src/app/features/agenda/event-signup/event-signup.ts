import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterResult, RegistrationStatus, register, registrationStatus } from '../../../core/data/registration';
import { DahiraEvent } from '../../../core/models';
import { TenantService } from '../../../core/tenant/tenant.service';
import { fmtDate, fmtTime } from '../../../core/utils/dates';

const MESSAGES: Record<Exclude<RegisterResult, 'ok'>, string> = {
  duplicate: 'Ce nom est déjà inscrit. Pas besoin de recommencer.',
  closed: 'Les inscriptions sont fermées.',
  full: 'Il n’y a plus assez de places.',
  invalid: 'Vérifiez le prénom, le nom et le numéro de téléphone.',
  disabled: 'Les inscriptions ne sont pas ouvertes pour cet événement.',
  unknown: 'Cet événement n’existe plus.',
  error: 'Pas de connexion. Réessayez dans un instant.',
};

/** Carte « Vous venez ? » : inscription en quelques secondes, sans compte. */
@Component({
  selector: 'app-event-signup',
  imports: [FormsModule],
  templateUrl: './event-signup.html',
  styleUrl: './event-signup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSignup {
  private readonly dahira = inject(TenantService).dahira;
  readonly event = input.required<DahiraEvent>();

  protected readonly settings = computed(() => this.event().registration!);
  protected readonly status = signal<RegistrationStatus | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  /** Prénom de la dernière personne inscrite (message de remerciement) */
  protected readonly done = signal<string | null>(null);
  /** Prénoms déjà inscrits depuis ce téléphone */
  protected readonly registered = signal<string[]>([]);
  protected first = '';
  protected last = '';
  protected phone = '';
  protected people = 1;

  protected readonly closesLabel = computed(() => {
    const iso = this.status()?.closesAt ?? this.settings().closesAt ?? this.event().startsAt;
    return `${fmtDate(iso)} à ${fmtTime(iso)}`;
  });

  private get storageKey(): string {
    return `dc-inscrit-${this.event().slug}`;
  }

  constructor() {
    // Dans le navigateur seulement : l'état change après la génération de la page
    afterNextRender(async () => {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? '[]');
        // Ancien format : un seul prénom
        const names: string[] = Array.isArray(saved) ? saved : [String(saved)];
        this.registered.set(names);
        if (names.length) this.done.set(names[names.length - 1]);
      } catch {
        const legacy = this.readLegacy();
        if (legacy) {
          this.registered.set([legacy]);
          this.done.set(legacy);
        }
      }
      try {
        this.status.set(await registrationStatus(this.dahira().slug, this.event().slug));
      } catch {
        this.status.set({ open: true });
      }
    });
  }

  /** Inscrire quelqu'un d'autre depuis le même téléphone (famille, ami) */
  protected another(): void {
    this.done.set(null);
    this.error.set('');
    this.first = this.last = this.phone = '';
    this.people = 1;
    setTimeout(() => document.getElementById('su-first')?.focus());
  }

  private readLegacy(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  protected async submit(): Promise<void> {
    const s = this.settings();
    const first = this.first.trim();
    const last = this.last.trim();
    const digits = this.phone.replace(/\D/g, '');
    if (!first || !last) {
      this.error.set('Écrivez votre prénom et votre nom.');
      return;
    }
    if ((s.phone === 'required' || digits) && digits.length < 9) {
      this.error.set('Numéro incomplet (ex. : 77 123 45 67).');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const result = await register(this.dahira().slug, this.event().slug, {
      first,
      last,
      phone: s.phone === 'hidden' ? undefined : this.phone.trim(),
      people: s.askPeople ? this.people : 1,
    });
    this.busy.set(false);
    if (result === 'ok' || result === 'duplicate') {
      this.done.set(first);
      if (!this.registered().includes(first)) this.registered.update((n) => [...n, first]);
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.registered()));
      } catch {
        /* stockage indisponible */
      }
      if (result === 'duplicate') this.error.set(MESSAGES.duplicate);
      return;
    }
    this.error.set(MESSAGES[result]);
    if (result === 'closed' || result === 'full') this.status.set({ ...this.status(), open: false, reason: result });
  }
}
