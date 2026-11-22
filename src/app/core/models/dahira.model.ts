export type ThemeToken =
  | 'color-primary'
  | 'color-primary-deep'
  | 'color-primary-mid'
  | 'color-brand'
  | 'color-on-brand'
  | 'color-gold'
  | 'color-gold-line'
  | 'color-gold-text'
  | 'color-accent-blue'
  | 'color-surface'
  | 'color-text-primary'
  | 'color-text-secondary'
  | 'focus-ring-color';

export interface JoinSettings {
  /** Discussion avec un responsable ou lien de groupe/chaîne */
  mode: 'chat' | 'group';
  /** Format international sans + : '221770000000' */
  whatsappNumber: string;
  prefilledMessage: string;
  groupInviteUrl?: string;
  callNumber?: string;
}

export interface SupportSettings {
  text: string;
  wave?: string;
  orangeMoney?: string;
  blessing?: string;
}

export type SocialPlatform = 'tiktok' | 'facebook' | 'instagram' | 'youtube' | 'whatsapp' | 'x';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  /** Nom du compte affiché : '@dahiramoutahabina' */
  handle?: string;
}

/** Annonce importante en haut de l'accueil (lieu déplacé, décès, collecte…) */
export interface Announcement {
  active: boolean;
  text: string;
  /** 'important' : fond sombre, pour ce qui ne doit pas être manqué */
  tone: 'info' | 'important';
  /** Lien facultatif : page d'un événement ('/agenda/…') ou adresse complète */
  linkUrl?: string;
  linkLabel?: string;
  /** Dernier jour d'affichage (AAAA-MM-JJ), inclus */
  until?: string;
}

export interface Dahira {
  id: string;
  slug: string;
  /** Adresse publique du site (aperçus de liens, Open Graph) : 'https://moutahabina.akkili.sn' */
  siteUrl?: string;
  name: string;
  shortName: string;
  nameArabic?: string;
  nameMeaning?: string;
  motto: string;
  /** Texte de l'anneau du médaillon */
  ringText: string;
  guideName: string;
  /** Photo du guide (portrait, format 4:5 conseillé) */
  guidePhotoUrl?: string;
  foundedYear: number;
  foundedPlace: string;
  membersApprox?: number;
  logoUrl: string;
  /** Logo réduit (128 px) pour les barres de navigation et le pied de page */
  logoSmallUrl?: string;
  /** Description courte du logo (texte alternatif) */
  logoAlt: string;
  theme: Partial<Record<ThemeToken, string>>;
  contact: { address: string; phone: string };
  join: JoinSettings;
  support?: SupportSettings;
  announcement?: Announcement;
  /** Réseaux sociaux, dans l'ordre d'affichage */
  social?: SocialLink[];
}
