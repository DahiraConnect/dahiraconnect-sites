import { parseVideo } from '../utils/video';
import { Photo } from './media.model';

export interface Album {
  id: string;
  slug: string;
  title: string;
  date: string;
  place?: string;
  /** Couverture (format 4:5 conseillé) ; sinon première photo, sinon aplat */
  coverUrl?: string;
  /** Vignette de la couverture (640 px) */
  coverThumbUrl?: string;
  /** Image d'aperçu WhatsApp 1200 × 630 (JPEG), fabriquée par l'admin depuis la couverture */
  shareImageUrl?: string;
  shareSourceUrl?: string;
  /** Aplat de repli tant qu'il n'y a pas de photo */
  fallback?: 'green' | 'gold' | 'blue' | 'sage';
  /** Mis en avant en tête de galerie */
  featured?: boolean;
  kind: 'photos' | 'video';
  /** Nombre total de photos s'il diffère de `photos.length` (album partiellement en ligne) */
  count?: number;
  /** Lien TikTok, YouTube ou Facebook (la vidéo n'est pas hébergée sur le site) */
  videoUrl?: string;
  durationMin?: number;
  photos?: Photo[];
}

/** Nombre de photos à afficher : total déclaré, sinon photos en ligne. */
export const albumPhotoCount = (album: Album) => album.count ?? album.photos?.length ?? 0;

/** Image de couverture : explicite, sinon première photo, sinon vignette YouTube. */
export const albumCover = (album: Album) =>
  album.coverThumbUrl ??
  album.coverUrl ??
  album.photos?.[0]?.thumbUrl ??
  album.photos?.[0]?.url ??
  (album.videoUrl ? parseVideo(album.videoUrl).thumbnailUrl : undefined);

/** 'TikTok', 'YouTube'… pour un album vidéo */
export const albumVideoLabel = (album: Album) =>
  album.videoUrl ? parseVideo(album.videoUrl).label : undefined;
