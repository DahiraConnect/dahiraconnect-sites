import { clickLabel, pageLabel, relativeTime, shortEmail } from './labels';

describe('admin / labels', () => {
  it('relativeTime', () => {
    const now = new Date('2026-11-23T12:00:00Z').getTime();
    expect(relativeTime('2026-11-23T11:59:40Z', now)).toBe('à l’instant');
    expect(relativeTime('2026-11-23T11:55:00Z', now)).toBe('il y a 5 min');
    expect(relativeTime('2026-11-23T09:00:00Z', now)).toBe('il y a 3 h');
    expect(relativeTime('2026-11-22T10:00:00Z', now)).toBe('hier');
    expect(relativeTime('2026-11-12T10:00:00Z', now)).toBe('le 12 nov.');
  });

  it('libellés', () => {
    expect(clickLabel('appel').label).toBe('Appels');
    expect(clickLabel('inconnu').label).toBe('inconnu');
    expect(pageLabel('/', new Map())).toBe('Accueil');
    expect(pageLabel('/agenda/ziar', new Map([['/agenda/ziar', 'Ziar']]))).toBe('Ziar');
    expect(shortEmail('aminata@gmail.com')).toBe('aminata');
    expect(shortEmail(null)).toBe('Système');
  });
});
