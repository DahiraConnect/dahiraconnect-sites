import { csvCell, matches, normalize, parseNameLine } from './search';

describe('admin / recherche et import', () => {
  it('normalize et matches', () => {
    expect(normalize('Ndèye COURA-Guèye')).toBe('ndeye coura gueye');
    expect(matches('coura ndeye', 'Ndèye Coura', 'Gueye')).toBeTrue();
    expect(matches('fall', 'Aminata Ndiaye')).toBeFalse();
    expect(matches('', 'x')).toBeTrue();
  });

  it('parseNameLine', () => {
    expect(parseNameLine('Ndeye Coura Gueye')).toEqual({ first: 'Ndeye Coura', last: 'Gueye' });
    expect(parseNameLine('Moussa Fall 77 123 45 67')).toEqual({ first: 'Moussa', last: 'Fall', phone: '771234567' });
    expect(parseNameLine('Aminata; Ndiaye')).toEqual({ first: 'Aminata', last: 'Ndiaye' });
    expect(parseNameLine('Seul')).toBeNull();
    expect(parseNameLine('   ')).toBeNull();
  });

  it('csvCell', () => {
    expect(csvCell('Fall')).toBe('Fall');
    expect(csvCell('a;b')).toBe('"a;b"');
    expect(csvCell(null)).toBe('');
  });
});
