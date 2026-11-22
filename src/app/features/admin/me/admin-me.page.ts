import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';
import { PublishService } from '../core/publish.service';

/** Mon profil : le prénom affiché à l'équipe (accueil de l'admin, historique). */
@Component({
  selector: 'app-admin-me',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="adm-page">
      <a class="adm-back" routerLink="/admin"><i class="ph ph-arrow-left" aria-hidden="true"></i> Tableau de bord</a>
      <h1 class="adm-title">Mon profil</h1>

      <div class="adm-card me">
        <span class="adm-avatar me__avatar" aria-hidden="true">{{ initial() }}</span>
        <p class="me__email">{{ auth.email() }}</p>
        <span class="adm-tag">{{ auth.current()?.role === 'owner' ? 'Propriétaire' : 'Éditeur' }}</span>
      </div>

      <form (ngSubmit)="save()" novalidate>
        <div class="adm-field">
          <label for="me-name">Votre prénom</label>
          <input id="me-name" name="name" autocomplete="given-name" [(ngModel)]="name" placeholder="Ex. : Aminata"
            aria-describedby="me-hint" />
          <p id="me-hint" class="adm-hint">Il remplace votre adresse e-mail dans l’historique et vous accueille sur le tableau de bord.</p>
        </div>
        <p class="adm-error" role="alert">{{ error() }}</p>
        <button type="submit" class="btn btn--dark me__save" [disabled]="busy()">
          <i class="ph ph-check" aria-hidden="true"></i> Enregistrer
        </button>
      </form>
    </div>
  `,
  styles: `
    .me { display: grid; justify-items: center; gap: var(--space-2); margin-bottom: var(--space-6); text-align: center; }
    .me__avatar { width: 88px; height: 88px; font-size: 40px; background: var(--color-gold); color: var(--color-primary-deep); }
    .me__email { margin: 0; color: var(--color-text-secondary); overflow-wrap: anywhere; }
    .me__save { width: 100%; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminMePage {
  protected readonly auth = inject(AdminAuth);
  private readonly notices = inject(PublishService);
  protected name = this.auth.hasName() ? this.auth.displayName() : '';
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly initial = computed(() => this.auth.displayName().charAt(0).toUpperCase());

  protected async save(): Promise<void> {
    const name = this.name.trim();
    if (!name) {
      this.error.set('Indiquez votre prénom.');
      return;
    }
    this.error.set('');
    this.busy.set(true);
    const ok = await this.auth.updateName(name);
    this.busy.set(false);
    if (ok) this.notices.show({ kind: 'ok', text: `C’est noté, ${name} !` });
    else this.error.set('L’enregistrement a échoué. Réessayez.');
  }
}
