import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

/**
 * Carte « Ne ratez plus aucun rendez-vous ».
 * V1 : maquette (émet les intentions, rien n'est enregistré). V2 : notifications web + newsletter.
 */
@Component({
  selector: 'app-notify-optin',
  templateUrl: './notify-optin.html',
  styleUrl: './notify-optin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyOptin {
  readonly activate = output<void>();
  readonly subscribeEmail = output<string>();

  protected readonly emailOpen = signal(false);
  protected readonly email = signal('');
  protected readonly status = signal('');

  protected onActivate(): void {
    this.activate.emit();
    this.status.set('Les rappels arrivent très bientôt. Merci de votre patience !');
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.reportValidity()) return;
    const value = this.email().trim();
    if (!value) return;
    this.subscribeEmail.emit(value);
    this.status.set('Merci ! Vous recevrez nos prochains rendez-vous par e-mail.');
    this.emailOpen.set(false);
  }
}
