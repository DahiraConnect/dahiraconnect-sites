import { Photo } from './media.model';

/** Inscriptions « Je viens » (Ziar, sortie, repas…) */
export interface EventRegistration {
  enabled: boolean;
  /** Fermeture des inscriptions (ISO) ; par défaut, le début de l'événement */
  closesAt?: string;
  /** Téléphone : non demandé, facultatif ou obligatoire */
  phone: 'hidden' | 'optional' | 'required';
  /** Demander le nombre de personnes (transport, repas) */
  askPeople?: boolean;
  /** Nombre de places au total */
  limit?: number;
}

export interface DahiraEvent {
  id: string;
  slug: string;
  title: string;
  /** ISO 8601 avec fuseau */
  startsAt: string;
  endsAt?: string;
  /** Heure pas encore annoncée : seule la date compte (« Heure à confirmer ») */
  timeTbc?: boolean;
  place: string;
  mapUrl?: string;
  /**
   * Aucune, une (affiche) ou plusieurs images.
   * La première sert de visuel principal et d'aperçu de partage.
   */
  images?: Photo[];
  description?: string;
  /** Badge « Grand événement » */
  isMajor?: boolean;
  /** Inscriptions des participants (facultatif) */
  registration?: EventRegistration;
  /** Lien vers l'album une fois passé */
  albumSlug?: string;
}
