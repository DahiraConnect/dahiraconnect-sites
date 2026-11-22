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
        <span class="adm-tag">{{ auth.roleLabel() }}</span>
        @if (auth.posts().length) {
          <p class="me__posts">{{ auth.posts().join(' · ') }}</p>
        }
      </div>

      <section class="adm-section" aria-labelledby="me-board">
        <h2 id="me-board">Ma place au bureau</h2>
        @if (people().length) {
          <div class="adm-field">
            <label for="me-person">Je suis…</label>
            <select id="me-person" [value]="auth.current()?.personId ?? ''" (change)="link($any($event.target).value)" [disabled]="linking()">
              <option value="">— Je ne suis pas dans le bureau —</option>
              @for (p of people(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
            <p class="adm-hint">Vos postes (Président, Trésorier, commission…) apparaissent alors dans votre profil et pour l’équipe.</p>
          </div>
        } @else {
          <p class="adm-hint">Le bureau n’a pas encore de membres. <a routerLink="/admin/bureau/personnes">Ajouter les personnes du bureau</a></p>
        }
      </section>

      <section class="adm-section" aria-labelledby="me-name-title">
        <h2 id="me-name-title">Mon prénom</h2>

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
      </section>
    </div>
  `,
  styles: `
    .me { display: grid; justify-items: center; gap: var(--space-2); margin-bottom: var(--space-6); text-align: center; }
    .me__avatar { width: 88px; height: 88px; font-size: 40px; background: var(--color-gold); color: var(--color-primary-deep); }
    .me__email { margin: 0; color: var(--color-text-secondary); overflow-wrap: anywhere; }
    .me__posts { margin: 0; font-weight: 700; color: var(--color-gold-text); }
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
  protected readonly linking = signal(false);
  protected readonly people = computed(() =>
    [...(this.auth.current()?.board?.people ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  );

  protected async link(personId: string): Promise<void> {
    this.linking.set(true);
    const ok = await this.auth.setMyPerson(personId || null);
    this.linking.set(false);
    const posts = this.auth.posts();
    this.notices.show(
      ok
        ? { kind: 'ok', text: personId ? `C’est noté${posts.length ? ' : ' + posts.join(', ') : ''}.` : 'Lien retiré.' }
        : { kind: 'warn', text: 'L’enregistrement a échoué. Réessayez.' },
    );
  }

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
