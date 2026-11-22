import { isAnnouncementVisible } from './announcement';

describe('annonce', () => {
  const base = { active: true, text: 'Le dahira est déplacé', tone: 'info' as const };
  const now = new Date('2026-11-24T10:00:00Z');

  it('visible si active, non vide et pas expirée', () => {
    expect(isAnnouncementVisible(base, now)).toBeTrue();
    expect(isAnnouncementVisible({ ...base, until: '2026-11-24' }, now)).toBeTrue();
    expect(isAnnouncementVisible({ ...base, until: '2026-11-23' }, now)).toBeFalse();
    expect(isAnnouncementVisible({ ...base, active: false }, now)).toBeFalse();
    expect(isAnnouncementVisible({ ...base, text: '  ' }, now)).toBeFalse();
    expect(isAnnouncementVisible(undefined, now)).toBeFalse();
  });
});
