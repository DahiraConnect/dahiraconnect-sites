import { Photo } from './media.model';

export interface Album {
  id: string;
  slug: string;
  title: string;
  date: string;
  place?: string;
  /** Couverture (format 4:5 conseillé) ; sinon première photo, sinon aplat */
  coverUrl?: string;
  /** Aplat de repli tant qu'il n'y a pas de photo */
  fallback?: 'green' | 'gold' | 'blue' | 'sage';
  /** Mis en avant en tête de galerie */
  featured?: boolean;
  kind: 'photos' | 'video';
  /** Nombre total de photos s'il diffère de `photos.length` (album partiellement en ligne) */
  count?: number;
  /** YouTube / Facebook / TikTok */
  videoUrl?: string;
  durationMin?: number;
  photos?: Photo[];
}

/** Nombre de photos à afficher : total déclaré, sinon photos en ligne. */
export const albumPhotoCount = (album: Album) => album.count ?? album.photos?.length ?? 0;

/** Image de couverture : explicite, sinon première photo. */
export const albumCover = (album: Album) => album.coverUrl ?? album.photos?.[0]?.url;
