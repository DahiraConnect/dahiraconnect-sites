/** Image avec ses dimensions d'origine (évite les sauts de mise en page). */
export interface Photo {
  url: string;
  /** Vignette 640 px (grilles, cartes) — générée par scripts/album-thumbnails.py */
  thumbUrl?: string;
  alt: string;
  width: number;
  height: number;
}
