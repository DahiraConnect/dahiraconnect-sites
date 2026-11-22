import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { TenantService } from '../../../core/tenant/tenant.service';
import { buildWaLink } from '../../../core/utils/whatsapp';

/**
 * Carte « Être prévenu » : tout passe par WhatsApp, déjà utilisé par tout le monde.
 * Chaîne du dahira si elle existe, sinon le groupe, sinon un message prêt pour le responsable.
 */
@Component({
  selector: 'app-notify-optin',
  templateUrl: './notify-optin.html',
  styleUrl: './notify-optin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyOptin {
  private readonly tenant = inject(TenantService);
  private readonly dahira = this.tenant.dahira;
  /** iPhone / Mac : le Calendrier s'abonne directement au lien webcal:// */
  private readonly apple = signal(false);

  /** Abonnement au calendrier en ligne (/agenda.ics) : Google Agenda sur Android, Calendrier sur iPhone */
  protected readonly calendarUrl = computed(() => {
    const webcal = this.tenant.absoluteUrl('/agenda.ics').replace(/^https?:/, 'webcal:');
    return this.apple() ? webcal : `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  });

  constructor() {
    afterNextRender(() => this.apple.set(/iPhone|iPad|Macintosh/.test(navigator.userAgent)));
  }

  protected readonly option = computed(() => {
    const d = this.dahira();
    const channel = d.social?.find((s) => s.platform === 'whatsapp')?.url;
    if (channel) {
      return {
        url: channel,
        track: 'suivre_chaine',
        text: 'Suivez la chaîne WhatsApp du dahira : chaque rendez-vous y est annoncé.',
        button: 'Suivre la chaîne',
      };
    }
    if (d.join.groupInviteUrl) {
      return {
        url: d.join.groupInviteUrl,
        track: 'rejoindre_groupe',
        text: 'Entrez dans le groupe WhatsApp du dahira : les rendez-vous y sont annoncés.',
        button: 'Entrer dans le groupe',
      };
    }
    return {
      url: buildWaLink(d.join.whatsappNumber, 'Assalamou aleykoum, je voudrais recevoir les annonces du dahira.'),
      track: 'demande_annonces',
      text: 'Écrivez-nous sur WhatsApp : nous vous enverrons les annonces des rendez-vous.',
      button: 'Recevoir les annonces',
    };
  });
}
