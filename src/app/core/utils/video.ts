export type VideoPlatform = 'youtube' | 'tiktok' | 'facebook' | 'other';

export interface VideoInfo {
  platform: VideoPlatform;
  /** 'YouTube', 'TikTok'… */
  label: string;
  /** Lien d'origine (ouvre l'application sur téléphone) */
  url: string;
  /** Lecteur intégrable, chargé seulement au clic */
  embedUrl?: string;
  /** Vignette fournie par la plateforme (YouTube uniquement) */
  thumbnailUrl?: string;
  /** Format du lecteur : vertical (TikTok, Shorts) ou horizontal */
  vertical: boolean;
}

const LABELS: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  other: 'la vidéo',
};

/**
 * Reconnaît un lien YouTube ou TikTok et prépare le lecteur intégré.
 * Liens courts TikTok (vm.tiktok.com) : pas d'identifiant → lien vers l'application seulement.
 */
export function parseVideo(url: string): VideoInfo {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { platform: 'other', label: LABELS.other, url, vertical: false };
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    const shorts = u.pathname.match(/^\/shorts\/([\w-]{11})/);
    const id =
      (host === 'youtu.be' ? u.pathname.slice(1, 12) : null) ??
      u.searchParams.get('v') ??
      shorts?.[1] ??
      u.pathname.match(/^\/(?:embed|live)\/([\w-]{11})/)?.[1];
    const valid = id && /^[\w-]{11}$/.test(id) ? id : undefined;
    return {
      platform: 'youtube',
      label: LABELS.youtube,
      url,
      vertical: !!shorts,
      embedUrl: valid ? `https://www.youtube-nocookie.com/embed/${valid}?autoplay=1&rel=0` : undefined,
      thumbnailUrl: valid ? `https://i.ytimg.com/vi/${valid}/hqdefault.jpg` : undefined,
    };
  }

  if (host.endsWith('tiktok.com')) {
    const id = u.pathname.match(/\/video\/(\d+)/)?.[1];
    return {
      platform: 'tiktok',
      label: LABELS.tiktok,
      url,
      vertical: true,
      embedUrl: id ? `https://www.tiktok.com/embed/v2/${id}` : undefined,
    };
  }

  if (host.endsWith('facebook.com') || host === 'fb.watch') {
    return { platform: 'facebook', label: LABELS.facebook, url, vertical: false };
  }

  return { platform: 'other', label: LABELS.other, url, vertical: false };
}
