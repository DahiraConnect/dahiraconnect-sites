import { Photo } from './media.model';

export interface DahiraEvent {
  id: string;
  slug: string;
  title: string;
  /** ISO 8601 avec fuseau */
  startsAt: string;
  endsAt?: string;
  /** Heure pas encore annoncée : seule la date compte (« Horaire à confirmer ») */
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
  /** Lien vers l'album une fois passé */
  albumSlug?: string;
}
