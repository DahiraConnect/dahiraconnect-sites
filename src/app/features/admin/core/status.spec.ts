import { effectiveStatus, saveAction } from './status';

describe('admin / statut', () => {
  it('saveAction suit le choix', () => {
    expect(saveAction('draft', null, false).label).toBe('Enregistrer le brouillon');
    expect(saveAction('published', null, false).label).toBe('Publier');
    expect(saveAction('published', null, true).label).toBe('Mettre à jour');
    expect(saveAction('scheduled', '2026-12-12T08:00:00Z', false).label).toBe('Programmer pour le 12 déc. à 8 h 00');
  });

  it('effectiveStatus : programmé et échu = publié', () => {
    expect(effectiveStatus('scheduled', '2020-01-01T00:00:00Z')).toBe('published');
    expect(effectiveStatus('scheduled', '2999-01-01T00:00:00Z')).toBe('scheduled');
  });
});
