import { groupPayments, normalizeNumber } from './payments';

describe('payments', () => {
  it('normalise les numéros (espaces, indicatif)', () => {
    expect(normalizeNumber('77 440 44 36')).toBe('774404436');
    expect(normalizeNumber('+221 77 440 44 36')).toBe('774404436');
    expect(normalizeNumber('00221774404436')).toBe('774404436');
  });

  it('regroupe Wave et Orange Money quand le numéro est le même', () => {
    const groups = groupPayments({ text: '', wave: '77 440 44 36', orangeMoney: '+221 774404436' });
    expect(groups.length).toBe(1);
    expect(groups[0].label).toBe('Wave ou Orange Money');
    expect(groups[0].number).toBe('77 440 44 36');
    expect(groups[0].methods.map((m) => m.id)).toEqual(['wave', 'orange-money']);
  });

  it('garde deux lignes quand les numéros diffèrent', () => {
    const groups = groupPayments({ text: '', wave: '77 000 00 00', orangeMoney: '78 000 00 00' });
    expect(groups.map((g) => g.label)).toEqual(['Wave', 'Orange Money']);
  });

  it('ignore un moyen absent', () => {
    expect(groupPayments({ text: '', wave: '77 000 00 00' }).length).toBe(1);
    expect(groupPayments(undefined)).toEqual([]);
  });
});
