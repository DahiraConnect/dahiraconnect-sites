import { parseSheetRows } from './excel';

describe('admin / import Excel', () => {
  it('lit le modèle, colonnes dans n’importe quel ordre', () => {
    const r = parseSheetRows([
      ['Nom', 'Prénom', 'Personnes', 'Téléphone'],
      ['Ndiaye', 'Aminata', 2, '77 123 45 67'],
      ['Fall', 'Moussa', null, null],
      [null, null, null, null],
    ]);
    expect(r.errors).toEqual([]);
    expect(r.people).toEqual([
      { first: 'Aminata', last: 'Ndiaye', phone: '77 123 45 67', people: 2 },
      { first: 'Moussa', last: 'Fall', people: 1 },
    ]);
  });

  it('erreurs lisibles avec le numéro de ligne', () => {
    const r = parseSheetRows([
      ['Prénom', 'Nom', 'Téléphone', 'Personnes'],
      ['Awa', '', '', ''],
      ['Ali', 'Sow', '12', ''],
      ['Fatou', 'Diop', '', '50'],
    ]);
    expect(r.people.length).toBe(0);
    expect(r.errors).toEqual([
      'Ligne 2 : le nom manque.',
      'Ligne 3 (Ali Sow) : numéro de téléphone incomplet.',
      'Ligne 4 (Fatou Diop) : « Personnes » doit être un nombre de 1 à 20.',
    ]);
  });

  it('refuse un fichier qui ne suit pas le modèle', () => {
    expect(parseSheetRows([['Nom complet'], ['Aminata Ndiaye']]).errors[0]).toContain('ne suit pas le modèle');
  });
});
