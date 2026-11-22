import { Photo } from '../../../core/models';
import { supabase } from './supabase';

/** Taille maximale des images envoyées (photo pleine, vignette) */
export const FULL_SIZE = 1600;
export const THUMB_SIZE = 640;

interface Encoded {
  blob: Blob;
  width: number;
  height: number;
  ext: 'webp' | 'jpg';
}

/** Dimensions réduites en gardant les proportions (jamais agrandies) */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const ratio = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

/**
 * Réduit une photo du téléphone (souvent 4 à 8 Mo) avant l'envoi : WebP,
 * ou JPEG si le navigateur ne sait pas produire de WebP (Safari).
 */
async function encode(bitmap: ImageBitmap, max: number): Promise<Encoded> {
  const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await toBlob('image/webp', 0.8);
  if (webp?.type === 'image/webp') return { blob: webp, width, height, ext: 'webp' };
  const jpeg = await toBlob('image/jpeg', 0.85);
  if (!jpeg) throw new Error('Image illisible');
  return { blob: jpeg, width, height, ext: 'jpg' };
}

const randomId = () => Math.random().toString(36).slice(2, 8);

/**
 * Envoie une photo dans le stockage du dahira (`media/<slug>/<dossier>/…`)
 * et renvoie l'objet `Photo` du site (URL, vignette, dimensions).
 */
export async function uploadPhoto(
  file: File,
  slug: string,
  folder: string,
  alt: string,
  /** Taille avant / après compression (pour l'afficher à l'utilisateur) */
  onSize?: (before: number, after: number) => void,
): Promise<Photo> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const [full, thumb] = [await encode(bitmap, FULL_SIZE), await encode(bitmap, THUMB_SIZE)];
    const base = `${slug}/${folder}/${Date.now().toString(36)}-${randomId()}`;
    const bucket = supabase().storage.from('media');
    const put = async (path: string, e: Encoded) => {
      const { error } = await bucket.upload(path, e.blob, {
        contentType: e.blob.type,
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw error;
      return bucket.getPublicUrl(path).data.publicUrl;
    };
    const url = await put(`${base}.${full.ext}`, full);
    const thumbUrl = await put(`${base}.640.${thumb.ext}`, thumb);
    onSize?.(file.size, full.blob.size);
    return { url, thumbUrl, alt, width: full.width, height: full.height };
  } finally {
    bitmap.close();
  }
}

/** 4 200 000 → '4,2 Mo' ; 310 000 → '310 Ko' */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;
  return `${Math.max(1, Math.round(bytes / 1000))} Ko`;
}

/** Supprime du stockage une photo envoyée depuis le back-office (les images du dépôt sont ignorées) */
export async function removePhoto(photo: Photo): Promise<void> {
  const marker = '/storage/v1/object/public/media/';
  const paths = [photo.url, photo.thumbUrl]
    .filter((u): u is string => !!u && u.includes(marker))
    .map((u) => decodeURIComponent(u.split(marker)[1]));
  if (paths.length) await supabase().storage.from('media').remove(paths);
}

/** Extension de fichier selon le type audio (webm sur Android, mp4 sur iPhone) */
export function audioExtension(type: string): string {
  if (type.includes('webm')) return 'webm';
  if (type.includes('ogg')) return 'ogg';
  if (type.includes('mpeg')) return 'mp3';
  if (type.includes('wav')) return 'wav';
  return 'm4a';
}

/** Envoie un message vocal dans le stockage du dahira (`media/<slug>/<dossier>/…`) */
export async function uploadAudio(blob: Blob, slug: string, folder: string): Promise<string> {
  const type = (blob.type || 'audio/mp4').split(';')[0];
  const path = `${slug}/${folder}/${Date.now().toString(36)}-${randomId()}.${audioExtension(type)}`;
  const bucket = supabase().storage.from('media');
  const { error } = await bucket.upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return bucket.getPublicUrl(path).data.publicUrl;
}
