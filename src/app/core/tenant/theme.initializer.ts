import { DOCUMENT, inject } from '@angular/core';
import { ThemeToken } from '../models';
import { tenantIconBase } from './manifest';
import { TenantService } from './tenant.service';

const STYLE_ID = 'tenant-theme';
// Valeurs CSS simples uniquement (couleurs) : pas d'injection via les données du dahira.
const SAFE_VALUE = /^[#\w\s(),.%/-]+$/;

export function themeCss(theme: Partial<Record<ThemeToken, string>>): string {
  const declarations = Object.entries(theme)
    .filter(([token, value]) => /^[a-z-]+$/.test(token) && !!value && SAFE_VALUE.test(value))
    .map(([token, value]) => `--${token}:${value};`)
    .join('');
  return declarations ? `:root{${declarations}}` : '';
}

/**
 * Écrit les surcharges de tokens du dahira dans un <style> du <head>.
 * Même chemin côté serveur (HTML rendu) et navigateur (hydratation).
 * À appeler dans un contexte d'injection ; la fonction renvoyée s'exécute après `TenantService.load()`.
 */
export function applyTenantTheme(): () => void {
  const document = inject(DOCUMENT);
  const tenant = inject(TenantService);
  return () => {
    const dahira = tenant.dahira();
    writeTheme(document, dahira.theme);
    writeIcons(document, dahira.slug, dahira.theme['color-primary'], dahira.logoUrl);
  };
}

/** Favicon, icône iPhone et couleur de barre du dahira courant. */
function writeIcons(document: Document, slug: string, primary?: string, logoUrl?: string): void {
  const base = tenantIconBase(slug);
  if (slug !== 'moutahabina') {
    document.getElementById('tenant-icon')?.removeAttribute('type');
    document.getElementById('tenant-icon')?.removeAttribute('sizes');
  }
  document
    .getElementById('tenant-icon')
    ?.setAttribute('href', slug === 'moutahabina' ? `${base}/favicon-96.png` : (logoUrl ?? ''));
  document
    .getElementById('tenant-apple-icon')
    ?.setAttribute(
      'href',
      slug === 'moutahabina' ? `${base}/apple-touch-icon.png` : (logoUrl ?? ''),
    );
  if (primary && SAFE_VALUE.test(primary)) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', primary);
  }
}

function writeTheme(document: Document, theme: Partial<Record<ThemeToken, string>>): void {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = themeCss(theme);
}
