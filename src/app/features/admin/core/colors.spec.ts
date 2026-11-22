import { PRESETS, SURFACE, contrast, isHex, mix, readableOn, themeFrom } from './colors';

describe('admin / colors', () => {
  it('contrast (valeurs WCAG connues)', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrast('#777777', '#FFFFFF')).toBeCloseTo(4.48, 1);
  });

  it('mix', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(isHex('#0a3a1b')).toBeTrue();
    expect(isHex('vert')).toBeFalse();
  });

  it('readableOn rend l’or lisible sur ivoire', () => {
    expect(contrast(readableOn('#E2B743'), SURFACE)).toBeGreaterThanOrEqual(4.5);
  });

  it('toutes les palettes proposées sont lisibles', () => {
    for (const p of PRESETS) {
      const t = themeFrom(p);
      expect(contrast(t['color-primary']!, SURFACE)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t['color-gold-text']!, SURFACE)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t['color-on-brand']!, t['color-brand']!)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
