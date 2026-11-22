import { fitWithin } from './images';
import { fromIso, slugify, toIso, uniqueSlug } from './slug';

describe('admin / slug', () => {
  it('slugify retire accents, apostrophes et ponctuation', () => {
    expect(slugify("Ziar Tivaouane 2026")).toBe('ziar-tivaouane-2026');
    expect(slugify("Récital de Khassaïdes : l'édition d'hiver !")).toBe('recital-de-khassaides-ledition-dhiver');
    expect(slugify('  ---  ')).toBe('');
  });

  it('uniqueSlug ajoute un suffixe si besoin', () => {
    expect(uniqueSlug('gamou', [])).toBe('gamou');
    expect(uniqueSlug('gamou', ['gamou', 'gamou-2'])).toBe('gamou-3');
    expect(uniqueSlug('', [])).toBe('page');
  });

  it('toIso / fromIso (heure du Sénégal = UTC)', () => {
    expect(toIso('2026-12-12', '20:30')).toBe('2026-12-12T20:30:00Z');
    expect(toIso('2026-12-12', null)).toBe('2026-12-12T12:00:00Z');
    expect(fromIso('2026-11-26T20:30:00Z')).toEqual({ date: '2026-11-26', time: '20:30' });
  });

  it('fitWithin réduit sans déformer ni agrandir', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(800, 1200, 1600)).toEqual({ width: 800, height: 1200 });
  });
});
