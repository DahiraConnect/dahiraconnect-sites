/** Recadrage carré : position (décalage en px d'affichage) et zoom → rectangle source dans l'image */
export interface CropView {
  /** Côté du cadre affiché (px) */
  frame: number;
  /** Taille réelle de l'image */
  width: number;
  height: number;
  /** Zoom ≥ 1 (1 = l'image remplit juste le cadre) */
  zoom: number;
  /** Décalage du centre de l'image par rapport au centre du cadre (px affichés) */
  x: number;
  y: number;
}

/** Échelle d'affichage : l'image couvre toujours le cadre */
export const displayScale = (v: Pick<CropView, 'frame' | 'width' | 'height' | 'zoom'>) =>
  (v.frame / Math.min(v.width, v.height)) * v.zoom;

/** Décalage limité : jamais de bord vide dans le cadre */
export function clampOffset(v: CropView): { x: number; y: number } {
  const s = displayScale(v);
  const maxX = Math.max(0, (v.width * s - v.frame) / 2);
  const maxY = Math.max(0, (v.height * s - v.frame) / 2);
  return { x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
}

/** Zone de l'image d'origine à garder (carré) */
export function sourceRect(v: CropView): { sx: number; sy: number; size: number } {
  const s = displayScale(v);
  const size = v.frame / s;
  const cx = v.width / 2 - v.x / s;
  const cy = v.height / 2 - v.y / s;
  return { sx: cx - size / 2, sy: cy - size / 2, size };
}
