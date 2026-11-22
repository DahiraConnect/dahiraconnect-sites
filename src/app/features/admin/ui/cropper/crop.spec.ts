import { clampOffset, sourceRect } from './crop';

describe('admin / recadrage', () => {
  const base = { frame: 300, width: 1200, height: 1800, zoom: 1, x: 0, y: 0 };

  it('sans déplacement : carré centré de la largeur de l’image', () => {
    expect(sourceRect(base)).toEqual({ sx: 0, sy: 300, size: 1200 });
  });

  it('déplacer l’image vers le bas montre le haut (le visage)', () => {
    const r = sourceRect({ ...base, y: 75 });
    expect(r.sy).toBe(0);
  });

  it('le décalage reste dans les limites', () => {
    expect(clampOffset({ ...base, x: 50, y: 999 })).toEqual({ x: 0, y: 75 });
  });

  it('zoom ×2 : zone deux fois plus petite', () => {
    expect(sourceRect({ ...base, zoom: 2 }).size).toBe(600);
  });
});
