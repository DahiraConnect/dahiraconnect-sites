import { Dahira } from '../models';
import { buildManifest } from './manifest';

describe('buildManifest', () => {
  const dahira = {
    slug: 'moutahabina',
    name: 'Dahira Moutahabina Fillahi',
    shortName: 'MOUTAHABINA',
    motto: "S'aimer pour Dieu, servir ensemble.",
    theme: {},
  } as unknown as Dahira;

  it('reprend le nom et la devise du dahira', () => {
    const m = buildManifest(dahira);
    expect(m.name).toBe('Dahira Moutahabina Fillahi');
    expect(m.short_name).toBe('Moutahabina');
    expect(m.lang).toBe('fr');
  });

  it('pointe vers les icônes du dahira, dont des icônes maskable', () => {
    const m = buildManifest(dahira);
    expect(m.icons.every((i) => i.src.startsWith('/assets/tenants/moutahabina/icons/'))).toBeTrue();
    expect(m.icons.some((i) => i.purpose === 'maskable')).toBeTrue();
  });

  it('suit la couleur principale du thème', () => {
    const m = buildManifest({ ...dahira, theme: { 'color-primary': '#123456' } });
    expect(m.theme_color).toBe('#123456');
    expect(m.background_color).toBe('#123456');
  });
});
