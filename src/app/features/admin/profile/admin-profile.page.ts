import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Dahira, Photo, SocialLink, SocialPlatform } from '../../../core/models';
import { PRESETS, Palette, SURFACE, contrast, isHex, themeFrom } from '../core/colors';
import { DahiraDocStore } from '../core/dahira-doc.store';
import { HelpTip } from '../ui/help-tip/help-tip';
import { PhotoPicker } from '../ui/photo-picker/photo-picker';
import { formatLocal, toWhatsappNumber } from '../core/phone';

interface ProfileForm {
  name: string;
  shortName: string;
  nameArabic: string;
  nameMeaning: string;
  ringText: string;
  foundedYear: string;
  foundedPlace: string;
  guideName: string;
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

/** Paramètres du dahira : identité, logo, guide, couleurs, rejoindre, soutien, contact, réseaux. */
@Component({
  selector: 'app-admin-profile',
  imports: [FormsModule, RouterLink, HelpTip, PhotoPicker],
  templateUrl: './admin-profile.page.html',
  styleUrl: './admin-profile.page.scss',
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
  /** Autres numéros de contact (affichés en bas de page) */
  protected readonly others = signal<{ label: string; phone: string }[]>([]);
  protected readonly logo = signal<Photo[]>([]);
  protected readonly guidePhoto = signal<Photo[]>([]);
  protected readonly presets = PRESETS;
  protected readonly palette = signal<Palette>(PRESETS[0]);
  /** Lisibilité des couleurs choisies (texte clair sur la couleur principale) */
  protected readonly paletteOk = computed(() => {
    const p = this.palette();
    return isHex(p.primary) && isHex(p.gold) && isHex(p.brand) && contrast(p.primary, SURFACE) >= 4.5;
  });

  constructor() {
    this.store.load(true).finally(() => this.loading.set(false));
    effect(() => {
      const d = this.store.profile();
      if (d) this.fill(d);
    });
  }

  private fill(d: Dahira): void {
    this.form = {
      name: d.name,
      shortName: d.shortName,
      nameArabic: d.nameArabic ?? '',
      nameMeaning: d.nameMeaning ?? '',
      ringText: d.ringText,
      foundedYear: String(d.foundedYear ?? ''),
      foundedPlace: d.foundedPlace ?? '',
      guideName: d.guideName ?? '',
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
    this.others.set(structuredClone(d.contact.others ?? []));
    this.logo.set([{ url: d.logoUrl, thumbUrl: d.logoSmallUrl, alt: d.logoAlt, width: 1, height: 1 }]);
    this.guidePhoto.set(d.guidePhotoUrl ? [{ url: d.guidePhotoUrl, alt: d.guideName, width: 1, height: 1 }] : []);
    this.palette.set({
      primary: d.theme?.['color-primary'] ?? PRESETS[0].primary,
      gold: d.theme?.['color-gold'] ?? PRESETS[0].gold,
      brand: d.theme?.['color-brand'] ?? PRESETS[0].brand,
    });
  }

  protected usePreset(p: Palette): void {
    this.palette.set({ primary: p.primary, gold: p.gold, brand: p.brand });
  }

  protected setColor(key: keyof Palette, value: string): void {
    this.palette.update((p) => ({ ...p, [key]: value.toUpperCase() }));
  }

  protected addOther(): void {
    this.others.update((o) => [...o, { label: '', phone: '' }]);
  }

  protected removeOther(i: number): void {
    this.others.update((o) => o.filter((_, j) => j !== i));
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
    if (!f.name.trim()) errors.name = 'Indiquez le nom complet du dahira.';
    if (!f.shortName.trim()) errors.shortName = 'Indiquez le nom court (barre du haut).';
    if (f.foundedYear && !/^(19|20)\d{2}$/.test(f.foundedYear.trim())) errors.foundedYear = 'Une année sur 4 chiffres (ex. : 1999).';
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
    if (!this.paletteOk()) {
      this.saveError.set('Couleur principale trop claire : le texte ne serait pas lisible. Choisissez une couleur plus foncée.');
      return;
    }
    const logo = this.logo()[0];
    const guide = this.guidePhoto()[0];
    const profile: Dahira = {
      ...d,
      name: f.name.trim(),
      shortName: f.shortName.trim().toUpperCase(),
      nameArabic: f.nameArabic.trim() || undefined,
      nameMeaning: f.nameMeaning.trim() || undefined,
      ringText: f.ringText.trim() || d.ringText,
      foundedYear: f.foundedYear ? Number(f.foundedYear) : d.foundedYear,
      foundedPlace: f.foundedPlace.trim(),
      guideName: f.guideName.trim(),
      guidePhotoUrl: guide?.url,
      logoUrl: logo?.url ?? d.logoUrl,
      logoSmallUrl: logo ? (logo.thumbUrl ?? logo.url) : d.logoSmallUrl,
      logoAlt: `Logo du ${f.name.trim()}`,
      theme: { ...d.theme, ...themeFrom(this.palette()) },
      motto: f.motto.trim(),
      membersApprox: f.membersApprox ? Number(f.membersApprox) : undefined,
      contact: {
        address: f.address.trim(),
        phone: !phone ? '' : phone.startsWith('221') ? `+221 ${formatLocal(phone)}` : `+${phone}`,
        others: this.others()
          .map((o) => ({ label: o.label.trim(), digits: toWhatsappNumber(o.phone) }))
          .filter((o) => o.label && o.digits)
          .map((o) => ({ label: o.label, phone: o.digits.startsWith('221') ? `+221 ${formatLocal(o.digits)}` : `+${o.digits}` })),
      },
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
    const ok = await this.store.saveProfile(JSON.parse(JSON.stringify(profile)), 'Paramètres enregistrés');
    this.busy.set(false);
    if (!ok) this.saveError.set('L’enregistrement a échoué. Vérifiez votre connexion et réessayez.');
  }
}
