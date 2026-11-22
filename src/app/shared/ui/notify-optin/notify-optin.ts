import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

/**
 * Carte « Être prévenu ».
 * V1 : aucun rappel n'est encore envoyé, le message le dit honnêtement (pas de faux formulaire).
 * V2 : notifications web et/ou e-mail, branchées sur le back-office.
 */
@Component({
  selector: 'app-notify-optin',
  templateUrl: './notify-optin.html',
  styleUrl: './notify-optin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyOptin {
  readonly activate = output<void>();
  protected readonly status = signal('');

  protected onActivate(): void {
    this.activate.emit();
    this.status.set(
      'Les rappels arrivent bientôt. En attendant, rejoignez le groupe WhatsApp du dahira pour ne rien manquer.',
    );
  }
}
