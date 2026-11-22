import { Dahira, DahiraEvent } from '../models';
import { eventLd, organizationLd } from './structured-data';

const dahira = {
  name: 'Dahira Moutahabina Fillahi',
  nameArabic: 'المتحابين في الله',
  motto: "S'aimer pour Dieu, servir ensemble.",
  logoUrl: '/assets/logo.webp',
  foundedYear: 1999,
  foundedPlace: 'Yeumbeul',
  contact: { address: 'Yeumbeul, Dakar', phone: '+221 77 000 00 00' },
  social: [{ platform: 'tiktok', url: 'https://www.tiktok.com/@x' }],
} as unknown as Dahira;
const site = 'https://moutahabina.akkili.sn';

describe('données structurées', () => {
  it('décrit le dahira (Organization)', () => {
    const ld = organizationLd(dahira, site);
    expect(ld['@type']).toBe('Organization');
    expect(ld.logo).toBe('https://moutahabina.akkili.sn/assets/logo.webp');
    expect(ld.sameAs).toEqual(['https://www.tiktok.com/@x']);
  });

  it('décrit un événement, avec la date seule si l’heure est à confirmer', () => {
    const event = { id: 'e', slug: 'ziar', title: 'Ziar', startsAt: '2026-12-20T12:00:00Z', timeTbc: true, place: 'Tivaouane' } as DahiraEvent;
    const ld = eventLd(event, dahira, site);
    expect(ld['@type']).toBe('Event');
    expect(ld.startDate).toBe('2026-12-20');
    expect(ld.url).toBe('https://moutahabina.akkili.sn/agenda/ziar/');
  });
});
