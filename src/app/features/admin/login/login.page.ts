import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';
import { supabaseConfigured } from '../core/supabase';

/**
 * Connexion sans mot de passe : l'adresse e-mail, puis le code à 6 chiffres reçu.
 * Le code se saisit sur le même écran (pas de lien qui s'ouvrirait dans un autre navigateur).
 */
@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPage {
  private readonly auth = inject(AdminAuth);
  private readonly router = inject(Router);
  private readonly codeInput = viewChild<ElementRef<HTMLInputElement>>('codeInput');

  protected readonly configured = supabaseConfigured;
  protected readonly step = signal<'email' | 'code'>('email');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected email = '';
  protected code = '';

  protected async send(): Promise<void> {
    const email = this.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.error.set('Vérifiez l’adresse e-mail (exemple : nom@gmail.com).');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const result = await this.auth.sendCode(email);
    this.busy.set(false);
    if (result === 'sent') {
      this.email = email;
      this.step.set('code');
      setTimeout(() => this.codeInput()?.nativeElement.focus());
    } else {
      this.error.set(
        result === 'unknown'
          ? 'Cette adresse n’est pas inscrite. Demandez au responsable du site de vous ajouter.'
          : 'Envoi impossible pour le moment. Vérifiez votre connexion et réessayez.',
      );
    }
  }

  protected async verify(): Promise<void> {
    const code = this.code.replace(/\D/g, '');
    if (code.length !== 6) {
      this.error.set('Le code contient 6 chiffres.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const ok = await this.auth.verifyCode(this.email, code);
    this.busy.set(false);
    if (ok) await this.router.navigateByUrl('/admin');
    else this.error.set('Code incorrect ou expiré. Vérifiez le dernier e-mail reçu, ou demandez un nouveau code.');
  }

  protected restart(): void {
    this.step.set('email');
    this.code = '';
    this.error.set('');
  }
}
