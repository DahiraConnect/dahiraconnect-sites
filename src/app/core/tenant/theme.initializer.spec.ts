import { themeCss } from './theme.initializer';

describe('themeCss', () => {
  it('produit les surcharges sur :root', () => {
    expect(themeCss({ 'color-primary': '#123456', 'color-gold': 'rgb(1 2 3 / 0.5)' })).toBe(
      ':root{--color-primary:#123456;--color-gold:rgb(1 2 3 / 0.5);}',
    );
  });

  it('ignore les valeurs dangereuses', () => {
    expect(themeCss({ 'color-primary': 'red;} body{display:none' })).toBe('');
  });

  it('renvoie une chaîne vide sans surcharge', () => {
    expect(themeCss({})).toBe('');
  });
});
