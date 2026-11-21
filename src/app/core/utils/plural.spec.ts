import { plural } from './plural';

describe('plural', () => {
  it('accorde au singulier pour 0 et 1, au pluriel au-delà', () => {
    expect(plural(0, 'membre')).toBe('0 membre');
    expect(plural(1, 'membre')).toBe('1 membre');
    expect(plural(28, 'membre')).toBe('28 membres');
  });

  it('accepte un pluriel irrégulier', () => {
    expect(plural(2, 'vidéo', 'vidéos')).toBe('2 vidéos');
  });
});
