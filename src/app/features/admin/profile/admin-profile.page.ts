import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Dahira, SocialLink, SocialPlatform } from '../../../core/models';
import { DahiraDocStore } from '../core/dahira-doc.store';
import { formatLocal, toWhatsappNumber } from '../core/phone';

interface ProfileForm {
  motto: string;
  membersApprox: string;
  address: string;
  phone: string;
  joinMode: 'chat' | 'group';
  whatsapp: string;
  message: string;
  groupUrl: string;
  callNumber: string;
  wave: string;
  orangeMoney: string;
  supportText: string;
  blessing: string;
}

const PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'whatsapp', label: 'Chaîne WhatsApp' },
  { id: 'x', label: 'X (Twitter)' },
];

/** Informations pratiques du dahira : rejoindre, contact, soutien, réseaux sociaux. */
@Component({
  selector: 'app-admin-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-profile.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminProfilePage {
  protected readonly store = inject(DahiraDocStore);
  protected readonly platforms = PLATFORMS;
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly errors = signal<Partial<Record<keyof ProfileForm, string>>>({});
  protected readonly saveError = signal('');
  protected form!: ProfileForm;
  protected readonly social = signal<SocialLink[]>([]);

  constructor() {
    this.store.load(true).finally(() => this.loading.set(false));
    effect(() => {
      const d = this.store.profile();
      if (d) this.fill(d);
    });
  }

  private fill(d: Dahira): void {
    this.form = {
      motto: d.motto,
      membersApprox: d.membersApprox ? String(d.membersApprox) : '',
      address: d.contact.address,
      phone: d.contact.phone ? formatLocal(toWhatsappNumber(d.contact.phone) || d.contact.phone) : '',
      joinMode: d.join.mode,
      whatsapp: d.join.whatsappNumber ? formatLocal(d.join.whatsappNumber) : '',
      message: d.join.prefilledMessage,
      groupUrl: d.join.groupInviteUrl ?? '',
      callNumber: d.join.callNumber ? formatLocal(toWhatsappNumber(d.join.callNumber)) : '',
      wave: d.support?.wave ?? '',
      orangeMoney: d.support?.orangeMoney ?? '',
      supportText: d.support?.text ?? '',
      blessing: d.support?.blessing ?? '',
    };
    this.social.set(structuredClone(d.social ?? []));
  }

  protected addSocial(): void {
    this.social.update((s) => [...s, { platform: 'tiktok', url: '' }]);
  }

  protected removeSocial(i: number): void {
    this.social.update((s) => s.filter((_, j) => j !== i));
  }

  protected revalidate(): void {
    if (Object.keys(this.errors()).length) this.validate();
  }

  private validate(): boolean {
    const f = this.form;
    const errors: Partial<Record<keyof ProfileForm, string>> = {};
    const optionalPhone = (key: keyof ProfileForm) => {
      const v = String(f[key]).trim();
      if (v && !toWhatsappNumber(v)) errors[key] = 'Numéro incomplet (ex. : 77 123 45 67).';
    };
    if (f.joinMode === 'chat' && !toWhatsappNumber(f.whatsapp)) errors.whatsapp = 'Indiquez un numéro WhatsApp complet (ex. : 77 123 45 67).';
    if (f.joinMode === 'group' && !/^https:\/\/(chat\.)?whatsapp\.com\//.test(f.groupUrl.trim()))
      errors.groupUrl = 'Collez le lien d’invitation du groupe (https://chat.whatsapp.com/…).';
    optionalPhone('callNumber');
    optionalPhone('phone');
    if (f.membersApprox && !/^\d+$/.test(f.membersApprox.trim())) errors.membersApprox = 'Un nombre, sans lettres.';
    if (!f.motto.trim()) errors.motto = 'La devise s’affiche en grand sur l’accueil.';
    this.errors.set(errors);
    return !Object.keys(errors).length;
  }

  protected async save(): Promise<void> {
    const d = this.store.profile();
    if (!d) return;
    if (!this.validate()) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const f = this.form;
    const call = toWhatsappNumber(f.callNumber);
    const phone = toWhatsappNumber(f.phone);
    const profile: Dahira = {
      ...d,
      motto: f.motto.trim(),
      membersApprox: f.membersApprox ? Number(f.membersApprox) : undefined,
      contact: { address: f.address.trim(), phone: !phone ? '' : phone.startsWith('221') ? `+221 ${formatLocal(phone)}` : `+${phone}` },
      join: {
        ...d.join,
        mode: f.joinMode,
        whatsappNumber: toWhatsappNumber(f.whatsapp) || d.join.whatsappNumber,
        prefilledMessage: f.message.trim() || d.join.prefilledMessage,
        groupInviteUrl: f.groupUrl.trim() || undefined,
        callNumber: call ? `+${call}` : undefined,
      },
      support: {
        ...d.support,
        text: f.supportText.trim(),
        wave: f.wave.trim() || undefined,
        orangeMoney: f.orangeMoney.trim() || undefined,
        blessing: f.blessing.trim() || undefined,
      },
      social: this.social()
        .filter((s) => /^https?:\/\//.test(s.url.trim()))
        .map((s) => ({ platform: s.platform, url: s.url.trim(), ...(s.handle?.trim() ? { handle: s.handle.trim() } : {}) })),
    };
    this.busy.set(true);
    this.saveError.set('');
    const ok = await this.store.saveProfile(JSON.parse(JSON.stringify(profile)), 'Informations enregistrées');
    this.busy.set(false);
    if (!ok) this.saveError.set('L’enregistrement a échoué. Vérifiez votre connexion et réessayez.');
  }
}
