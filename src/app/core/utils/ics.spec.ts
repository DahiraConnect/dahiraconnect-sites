import { DahiraEvent } from '../models';
import { buildIcsDataUrl } from './ics';

const decode = (url: string) => decodeURIComponent(url.split(',')[1]);
const base: DahiraEvent = { id: 'e1', slug: 'e1', title: 'Ziar à Tivaouane', startsAt: '2026-12-20T12:00:00Z', place: 'Tivaouane' };

describe('buildIcsDataUrl', () => {
  it('crée un événement horodaté quand l’heure est connue', () => {
    const ics = decode(buildIcsDataUrl({ ...base, startsAt: '2026-11-26T20:30:00Z', endsAt: '2026-11-26T23:00:00Z' }, 'Dahira', 'https://x.sn'));
    expect(ics).toContain('DTSTART:20261126T203000Z');
    expect(ics).toContain('DTEND:20261126T230000Z');
  });

  it('crée un événement « journée entière » quand l’heure est à confirmer', () => {
    const ics = decode(buildIcsDataUrl({ ...base, timeTbc: true }, 'Dahira', 'https://x.sn'));
    expect(ics).toContain('DTSTART;VALUE=DATE:20261220');
    expect(ics).toContain('DTEND;VALUE=DATE:20261221');
  });

  it('ajoute un rappel la veille', () => {
    expect(decode(buildIcsDataUrl(base, 'Dahira', 'https://x.sn'))).toContain('TRIGGER:-P1D');
  });
});
