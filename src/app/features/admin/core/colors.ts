import { ThemeToken } from '../../../core/models';

/** Fond ivoire du site, et texte clair posé sur les couleurs sombres */
export const SURFACE = '#F4EFE3';

type Rgb = [number, number, number];

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);
const toRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const toHex = (rgb: Rgb) => '#' + rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** Mélange vers une autre couleur (0 = inchangé, 1 = cible) */
export function mix(hex: string, target: string, amount: number): string {
  const a = toRgb(hex);
  const b = toRgb(target);
  return toHex(a.map((c, i) => c + (b[i] - c) * amount) as Rgb);
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapport de contraste WCAG (1 à 21) */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Assombrit jusqu'à être lisible sur le fond (≥ 4.5:1) */
export function readableOn(hex: string, background = SURFACE): string {
  let c = hex;
  for (let i = 0; i < 20 && contrast(c, background) < 4.5; i++) c = mix(c, '#000000', 0.1);
  return c;
}

/** Contour de focus visible (≥ 3:1) à la fois sur le fond ivoire et sur la couleur principale */
export function focusColor(gold: string, primary: string): string {
  for (let i = 0; i <= 20; i++) {
    const c = mix(gold, '#000000', i * 0.04);
    if (contrast(c, SURFACE) >= 3 && contrast(c, primary) >= 3) return c;
  }
  return readableOn(gold);
}

export interface Palette {
  primary: string;
  gold: string;
  brand: string;
}

/** Trois couleurs choisies → tous les jetons du thème */
export function themeFrom(p: Palette): Partial<Record<ThemeToken, string>> {
  const deep = mix(p.primary, '#000000', 0.35);
  return {
    'color-primary': p.primary,
    'color-primary-deep': deep,
    'color-primary-mid': mix(p.primary, '#FFFFFF', 0.12),
    'color-text-primary': p.primary,
    'color-brand': p.brand,
    'color-on-brand': contrast(deep, p.brand) >= 4.5 ? deep : '#FFFFFF',
    'color-gold': p.gold,
    'color-gold-line': mix(p.gold, '#000000', 0.05),
    'color-gold-text': readableOn(p.gold),
    'focus-ring-color': focusColor(p.gold, p.primary),
  };
}

/** Palettes proposées (la première = charte Moutahabina) */
export const PRESETS: (Palette & { name: string })[] = [
  { name: 'Vert et or', primary: '#0A3A1B', gold: '#E2B743', brand: '#1BB13E' },
  { name: 'Bleu nuit', primary: '#14284B', gold: '#E2B743', brand: '#1BB13E' },
  { name: 'Bordeaux', primary: '#5A1626', gold: '#D9A441', brand: '#1BB13E' },
  { name: 'Terre', primary: '#4A2C17', gold: '#D8A24A', brand: '#1BB13E' },
  { name: 'Vert émeraude', primary: '#0B4A3F', gold: '#E0B64B', brand: '#1BB13E' },
];
