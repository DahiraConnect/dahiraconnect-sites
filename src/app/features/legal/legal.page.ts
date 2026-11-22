import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../core/tenant/tenant.service';
import { buildWaLink } from '../../core/utils/whatsapp';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';

/** Mentions légales et confidentialité, en français simple (données du dahira courant) */
@Component({
  selector: 'app-legal-page',
  imports: [RouterLink, DarkHero],
  templateUrl: './legal.page.html',
  styleUrl: './legal.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LegalPage {
  /** Donnée de route : 'mentions' ou 'confidentialite' */
  readonly kind = input<'mentions' | 'confidentialite'>('mentions');
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly site = computed(() => (this.dahira().siteUrl ?? '').replace(/^https?:\/\//, '').replace(/\/$/, ''));
  protected readonly telUrl = computed(() => `tel:${this.dahira().contact.phone.replace(/\s/g, '')}`);
  /** Demande de retrait ou de correction : un message WhatsApp déjà écrit */
  protected readonly requestUrl = computed(() =>
    buildWaLink(
      this.dahira().join.whatsappNumber,
      'Assalamou aleykoum, je voudrais faire retirer ou corriger une information me concernant sur le site du dahira.',
    ),
  );
}
