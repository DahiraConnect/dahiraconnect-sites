import {
  daysUntil,
  fmtCountdown,
  fmtDate,
  fmtDay,
  fmtEventTime,
  fmtMonthShort,
  fmtMonthYear,
  fmtTime,
  fmtTimeRange,
  fmtWeekday,
  monthKey,
} from './dates';

describe('dates utils', () => {
  const recital = '2026-12-05T20:30:00Z';

  describe('daysUntil', () => {
    it('compte les jours calendaires', () => {
      expect(daysUntil(recital, new Date('2026-11-21T10:00:00Z'))).toBe(14);
    });

    it("renvoie 0 le jour même, même si l'heure est passée", () => {
      expect(daysUntil(recital, new Date('2026-12-05T23:00:00Z'))).toBe(0);
    });

    it('renvoie 1 la veille au soir', () => {
      expect(daysUntil(recital, new Date('2026-12-04T23:59:00Z'))).toBe(1);
    });

    it('ne descend jamais sous 0', () => {
      expect(daysUntil('2026-10-25T09:00:00Z', new Date('2026-11-21T10:00:00Z'))).toBe(0);
    });
  });

  it('formate le jour sur deux chiffres', () => {
    expect(fmtDay(recital)).toBe('05');
  });

  it('formate le mois court en capitales', () => {
    expect(fmtMonthShort(recital)).toBe('DÉC.');
    expect(fmtMonthShort('2027-01-10T08:00:00Z')).toBe('JANV.');
    expect(fmtMonthShort('2027-02-14T10:00:00Z')).toBe('FÉVR.');
  });

  it('formate le jour de semaine avec majuscule', () => {
    expect(fmtWeekday(recital)).toBe('Samedi');
  });

  it('formate les dates longues', () => {
    expect(fmtDate('2026-10-25T09:00:00Z')).toBe('25 octobre 2026');
    expect(fmtMonthYear('2026-11-07')).toBe('Novembre 2026');
  });

  it("formate l'heure à la française", () => {
    expect(fmtTime(recital)).toBe('20 h 30');
    expect(fmtTime('2026-12-19T16:00:00Z')).toBe('16 h');
    expect(fmtTime('2027-01-10T08:00:00Z')).toBe('8 h');
    expect(fmtTimeRange('2027-02-14T10:00:00Z', '2027-02-14T22:00:00Z')).toBe('10 h – 22 h');
  });

  it("affiche « Heure à confirmer » si l'heure n'est pas annoncée", () => {
    expect(fmtEventTime({ startsAt: '2026-12-12T12:00:00Z', timeTbc: true })).toBe('Heure à confirmer');
    expect(fmtEventTime({ startsAt: recital })).toBe('20 h 30');
  });

  it('formate le compte à rebours', () => {
    expect(fmtCountdown(0)).toBe("Aujourd'hui");
    expect(fmtCountdown(1)).toBe('Demain');
    expect(fmtCountdown(14)).toBe('Dans 14 jours');
  });

  it('calcule la clé de mois', () => {
    expect(monthKey(recital)).toBe('2026-12');
  });
});
